import path from "path";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import { BufferWindowMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

import { fetchShopwareProducts } from "./shopwareHelper.js";


export default async function handler(req: any, res: any) {
  const { question, history, client, bot, settings } = req.body;

  // Improved Keyword Extraction Logic
  const extractProductKeyword = (input) => {
    const PRODUCT_KEYWORDS = ["watches", "shoes", "bags", "products", "accessories"];
    const match = PRODUCT_KEYWORDS.find((keyword) =>
      input.toLowerCase().includes(keyword)
    );
    return match || "popular"; // Default to "popular" if no keyword is found
  };

  const productKeyword = extractProductKeyword(question);
  let productRecommendations = [];

  try {
    // Fetch Product Recommendations
    productRecommendations = await fetchShopwareProducts(productKeyword);
  } catch (err) {
    console.error("Error fetching products:", err);
    productRecommendations = []; // Ensure recommendations are always an array
  }



  const maintainChatHistory = (chatHistory: any, conversationLimit: any) => {
    // Parse the JSON object into a JavaScript array
    let chatHistoryArray = chatHistory;//JSON.parse(chatHistory);

    // Calculate the number of conversations to remove
    const conversationCount = chatHistoryArray.length;
    const conversationsToRemove = Math.max(0, conversationCount - conversationLimit);

    // Remove the old conversations
    if (conversationsToRemove > 0) {
      chatHistoryArray.splice(0, conversationsToRemove);
    }
    // Convert the JavaScript array back to a JSON string
    return chatHistoryArray;
  }

  const maintainedChatHistory = maintainChatHistory(history, settings.allowChatHistory == '1' ? 2 : 0);

  const systemPromptTemplate = settings.systemPrompt + `
  Some chat history is provided as Text don't output this text. Don't preface your answer with "AI:" or "As an AI assistant".
  Don’t justify your answers. Don't refer to yourself in any of the created content.
  REMEMBER: only recommend content that is available on LIBRARY if you don't have any content to recommend say I did not found any content.
  REMEMBER: Answer the input in the same language it was asked in.
  REMEMBER: You have access to the chat history with the user (CHATHISTORY/MEMORY) and to context (LIBRARY) provided by the user. 
  When answering, consider whether the question refers to something in the MEMORY or CHATHISTORY before checking the LIBRARY.
  Follow Up Input: {input}
  LIBRARY: {context}
  CHATHISTORY: 
  {history}`;

  const systemPrompt = SystemMessagePromptTemplate.fromTemplate(systemPromptTemplate);

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    systemPrompt,
    HumanMessagePromptTemplate.fromTemplate('QUESTION: """{input}"""'),
  ]);


  const windowMemory = new BufferWindowMemory({ k: 2 }); // Adjust 'k' as needed
  const dataPath = process.env.dataPath || "default/path";
  const sanitizedQuestion = question.trim().replace("\n");
  const clientFolder = client;
  const dir = path.resolve(dataPath, clientFolder, bot, "data");

  const callback1 = BaseCallbackHandler.fromMethods({
    // This function is called when the LLM generates a new token (i.e., a prediction for the next word)
    async handleLLMNewToken(token: string) {
      // Write the token to the output stream (i.e., the console)
      console.log(token);
      onTokenStream(token);
    },
  });

  try {
    const pinecone = new PineconeClient({
      apiKey:
        'pcsk_2feGQJ_BdGdtB11PVrHAXAaFStXTd8hMi4PksJzv5UN3E8DzLMZ58Aww4ANutnpxDN99H2',
    });

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });
    const pineconeIndex = pinecone.Index('chatbot');

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
      maxConcurrency: 5,
      // You can pass a namespace here too
      // namespace: "foo",
    });
    const llm = new ChatOpenAI({
      temperature: settings.chatTemperature,
      maxTokens: settings.chatModel === 'gpt-3.5-turbo' ? 4096 : 3000,
      maxRetries: 5,
      modelName: settings.chatModel,
      streaming: true,
      callbacks: [callback1],
    });
    const chain = new LLMChain({
      prompt: chatPrompt,
      // memory: windowMemory,
      llm,
      callbacks: [callback1],
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });

    // const vectorStore = await HNSWLib.load(dir, new OpenAIEmbeddings());
    const vectorStoreResult = await vectorStore.similaritySearch(question, 3);

    // console.log("vectorStoreResult", vectorStoreResult);

    await chain.call({
      input: sanitizedQuestion,
      context: vectorStoreResult,
      history: JSON.stringify(maintainedChatHistory),
      immediate_history: windowMemory,
    });

    // await res.write(`data: ${JSON.stringify({ data: productRecommendations })}\n\n`);
    await res.write(`data: ${JSON.stringify({ data: "[DONE]" })}\n\n`);

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    res.write(`data: ${JSON.stringify({ data: "[DONE]" })}\n\n`);
  }

  function onTokenStream(token: any) {
    res.write(`data: ${JSON.stringify({ data: token })}\n\n`);
  }
}
