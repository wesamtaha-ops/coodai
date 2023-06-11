import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";
import path from 'path';
import fs from 'fs';

const FILENAMES = [
    path.resolve('public', 'store', 'tafseer.docx'),
    // path.resolve('public', 'store', 'tafseer.doc'),
    // path.resolve('public', 'store', 'ads-in-votly.pdf'),
    // 'https://votly.app',
    // 'https://wevo.ae',  
    // 'https://wevo.ae/en/index.html',
    // 'https://wevo.ae/contact.html', 
    // 'https://wevo.ae/index.html', 
    // 'https://wevo.ae/download.html', 
    // 'https://wevo.ae/market.html', 
    // 'https://wevo.ae/sales.php', 
    // 'https://wevo.ae/root.html', 
    // 'https://wevo.ae/offers.html', 
    // 'https://wevo.ae/names.html', 
    // 'https://wevo.ae/rooms.html', 
    // 'https://wevo.ae/ar/index.html', 
    // 'https://wevo.ae/nicknames.html', 
    // 'https://wevo.ae/features.html', 
    // 'https://wevo.ae/ar/nicknames.html', 
    // 'https://wevo.ae/ar/contact.html', 
    // 'https://wevo.ae/ar/features.html'
];

async function runIngest(clientFolder: string) {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    let allDocs: any[] = [];

    for (let i = 0; i < FILENAMES.length; i++) {
        const ext = path.extname(FILENAMES[i]);
        let rawDocs;

        if (FILENAMES[i].includes('https://')) {
            const loader = new PlaywrightWebBaseLoader(FILENAMES[i], {
                launchOptions: {
                    headless: true,
                },
                gotoOptions: {
                    waitUntil: "domcontentloaded",
                }
            });
            rawDocs = await loader.load();
        } else {
            if (ext === '.txt') {
                const loader = new TextLoader(FILENAMES[i]);
                rawDocs = await loader.load();
                console.log(rawDocs);
            } else if (ext === '.pdf') {
                const loader = new PDFLoader(FILENAMES[i]);
                rawDocs = await loader.load();
                console.log(rawDocs);
            } else if (ext === '.csv') {
                const loader = new CSVLoader(FILENAMES[i]);
                rawDocs = await loader.load();
            } else if (ext === '.docx') {
                const loader = new DocxLoader(FILENAMES[i]);
                rawDocs = await loader.load();
            } else {
                console.log(`Unsupported file type: ${ext}`);
                continue;
            }
        }

        console.log(`Loader created for file: ${FILENAMES[i]}`);

        const docs = await textSplitter.splitDocuments(rawDocs);
        console.log(`Docs splitted for file: ${FILENAMES[i]}`);

        allDocs = [...allDocs, ...docs];
    }

    console.log("Creating vector store...");
    const vectorStore = await HNSWLib.fromDocuments(allDocs, new OpenAIEmbeddings());
    console.log(vectorStore);

    const clientFolderPath = path.resolve('data', 'clients', clientFolder);
    fs.mkdirSync(clientFolderPath, { recursive: true });
    process.chdir(clientFolderPath);

    await vectorStore.save(`data`);
    console.log("Vector store created.");
}

export default async (req: { method: string; query: { client: string } }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
    if (req.method === 'GET') {
        const clientFolder = req.query.client;
        await runIngest(clientFolder);
        res.status(200).send('Ingestion process completed successfully');
    } else {
        res.status(405).send('Method not allowed'); // only GET method is allowed
    }
};
