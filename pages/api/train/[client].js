const fs = require('fs');
const path = require('path');
const { HNSWLib } = require("langchain/vectorstores");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { PuppeteerWebBaseLoader } = require("langchain/document_loaders/web/puppeteer");

async function runIngest(clientFolder) {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    let allDocs = [];
    let originalDir = process.cwd();
    process.chdir(originalDir);

    const dataPath = process.env.dataPath;
    const storeFolderPath = path.resolve(dataPath + clientFolder + '/original/');
    const clientFolderPath = path.resolve(dataPath + clientFolder);

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
        if (ext === '.txt' || ext === '.json') {
            if (fileName === 'urls.txt') continue;
            if (fileName === 'settings.json') continue; // Exclude urls.txt from ingestion
            // const fileContent = fs.readFileSync(filePath, 'utf8');
            // if (fileContent.trim() === '' || fileName === 'qa.txt') continue; // Skip empty txt files and qa.txt
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
    console.log("Creating vector store...");
    const vectorStore = await HNSWLib.fromDocuments(allDocs, new OpenAIEmbeddings());
    fs.mkdirSync(clientFolderPath, { recursive: true });
    process.chdir(clientFolderPath);
    await vectorStore.save(`data`);
    process.chdir(originalDir);
    console.log("Vector store created.");
}


module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const clientFolder = req.query.client;
        if (!clientFolder) {
            res.status(400).send('Client name is required in the URL');
            return;
        }
        try {
            await runIngest(clientFolder);
            res.status(200).send('Ingestion process completed successfully');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error occurred during ingestion' + res);
        }
    } else {
        res.status(405).send('Method not allowed'); // only GET method is allowed
    }
};
