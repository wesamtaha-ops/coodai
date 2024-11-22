const fs = require('fs');
const path = require('path');
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-large',
});

async function runIngest(clientFolder, botFolder) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  let allDocs = [];
  let originalDir = process.cwd();
  process.chdir(originalDir);

  const dataPath = process.env.dataPath;
  const storeFolderPath = path.resolve(
    dataPath + clientFolder + '/' + botFolder + '/original/',
  );
  const botFolderPath = path.resolve(dataPath + clientFolder + '/' + botFolder);

  const fileNames = fs.readdirSync(storeFolderPath);

  // Check if urls.txt file exists and has content
  if (fs.existsSync(path.join(storeFolderPath, 'urls.txt'))) {
    const urlFilePath = path.join(storeFolderPath, 'urls.txt');
    const urlFileContent = fs.readFileSync(urlFilePath, 'utf8');
    const urls = urlFileContent.split('\n').filter(Boolean);

    // Add URLs to the allDocs array
    for (const url of urls) {
      if (url.trim() === '') continue; // Skip empty URLs

      const loader = new PuppeteerWebBaseLoader(url);
      const rawDocs = await loader.load();
      console.log(rawDocs);

      const docs = await textSplitter.splitDocuments(rawDocs);
      console.log(`Docs splitted for URL: ${url}`);

      allDocs = [...allDocs, ...docs];
    }
  }

  for (const fileName of fileNames) {
    const filePath = path.join(storeFolderPath, fileName);
    const ext = path.extname(filePath);
    let rawDocs;
    // Handle txt files

    // Handle txt files
    if (ext === '.txt') {
      if (fileName === 'urls.txt') continue;
      const loader = new TextLoader(filePath);
      rawDocs = await loader.load();
      console.log(rawDocs);
    }
    // Handle other file types
    else if (ext === '.pdf') {
      const loader = new PDFLoader(filePath);
      rawDocs = await loader.load();
      console.log(rawDocs);
    } else if (ext === '.csv') {
      const loader = new CSVLoader(filePath);
      rawDocs = await loader.load();
    } else if (ext === '.docx') {
      const loader = new DocxLoader(filePath);
      rawDocs = await loader.load();
    } else if (ext === '.json') {
      if (fileName === 'settings.json') continue; // Exclude urls.txt from ingestion
      const loader = new JSONLoader(filePath);
      rawDocs = await loader.load();
      console.log(rawDocs);
    } else {
      console.log(`Unsupported file type: ${ext}`);
      continue;
    }

    console.log(`Loader created for file: ${filePath}`);

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log(`Docs splitted for file: ${filePath}`);

    allDocs = [...allDocs, ...docs];
  }

  originalDir = process.cwd();
  console.log('Creating vector store...');

  const pinecone = new PineconeClient({
    apiKey:
      'pcsk_2feGQJ_BdGdtB11PVrHAXAaFStXTd8hMi4PksJzv5UN3E8DzLMZ58Aww4ANutnpxDN99H2',
  });
  // Will automatically read the PINECONE_API_KEY and PINECONE_ENVIRONMENT env vars
  // await pinecone.createIndex(botFolder, {
  //   name: 'serverless-index',
  //   dimension: 1536,
  //   spec: {
  //     serverless: {
  //       cloud: 'aws',
  //       region: 'us-west-2',
  //     },
  //   },
  //   waitUntilReady: true,
  // });

  // await pinecone.createIndex({
  //   name: botFolder,
  //   dimension: 1536,
  //   metric: 'cosine',
  //   spec: {
  //     pod: {
  //       environment: 'us-west1-gcp',
  //       podType: 'p1.x1',
  //       pods: 1,
  //     },
  //   },
  //   deletionProtection: 'disabled',
  // });

  const pineconeIndex = pinecone.Index(botFolder);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 1,
    // You can pass a namespace here too
    // namespace: "foo",
  });

  await vectorStore.addDocuments(allDocs);

  //   fs.mkdirSync(botFolderPath, { recursive: true });
  process.chdir(botFolderPath);
  //   await vectorStore.save(`data`);
  process.chdir(originalDir);
  console.log('Vector store created.');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const clientFolder = req.query.client;
    const botFolder = req.query.bot;
    if (!botFolder) {
      res.status(400).send('Client name is required in the URL');
      return;
    }
    try {
      await runIngest(clientFolder, botFolder);
      res.status(200).send('Ingestion process completed successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error occurred during ingestion' + res);
    }
  } else {
    res.status(405).send('Method not allowed'); // only GET method is allowed
  }
}
