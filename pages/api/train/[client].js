const fs = require('fs');
const path = require('path');
const { HNSWLib } = require("langchain/vectorstores");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const { TextLoader } = require("langchain/document_loaders/fs/text");

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

    for (const fileName of fileNames) {
        const filePath = path.join(storeFolderPath, fileName);
        const ext = path.extname(filePath);
        let rawDocs;

        if (ext === '.txt') {
            const loader = new TextLoader(filePath);
            rawDocs = await loader.load();
            console.log(rawDocs);
        } else if (ext === '.pdf') {
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
