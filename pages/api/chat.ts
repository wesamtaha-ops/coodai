// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { makeChain } from "./util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { question, history, client } = req.body;

  if (!question) {
    return res.status(400).json({ message: "No question in the request" });
  }
  const originalDir = process.cwd();
  process.chdir(originalDir);
  
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");
  const clientFolder = client as string; // Assuming the client parameter is a string
  const dir = path.resolve(process.cwd(), "data", "clients", clientFolder, "data");

  const vectorstore = await HNSWLib.load(dir, new OpenAIEmbeddings());

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const sendData = (data: string) => {
    console.log(data);
    res.write(`data: ${data}\n\n`);
  };

  sendData(JSON.stringify({ data: "" }));
  const chain = makeChain(vectorstore, (token: string) => {
    sendData(JSON.stringify({ data: token }));
  });

  try {
    await chain.call({
      question: question,
      chat_history: history,
    });
  } catch (err) {
    console.error(err);
    // Ignore error
  } finally {
    sendData("[DONE]");
    res.end();
  }
}