import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { makeChain } from "./util";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { question, history, client } = req.body;


  if (!question) {
    return res.status(400).json({ message: "No question in the request" });
  }

  if (!client) {
    return res.status(400).json({ message: "No client in the request" });
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");
  const clientFolder = client as string; // Assuming the client parameter is a string
  const dir = path.resolve(process.cwd(), "data", "clients", clientFolder, "data");
  const vectorStore = await HNSWLib.load(dir, new OpenAIEmbeddings());

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  sendData(JSON.stringify({ data: "" }));

  sendData(JSON.stringify({ data: "" }));
  const chain = makeChain(vectorStore, (token: string) => {
    sendData(JSON.stringify({ data: token }));
  });

  try {
    // Ask Question
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });
    sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }));
  } catch (error) {
    console.error("error", error);
    // Ignore error
  } finally {
    sendData("[DONE]");
    res.end();
  }
}
