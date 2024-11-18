import path from "path";
// import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { BufferWindowMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";


export default async function handler(req: any, res: any) {
  const { question, history, client, bot, settings } = req.body;

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
    // const vectorstore = await HNSWLib.load(dir, new OpenAIEmbeddings());
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
    // const vectorStoreResult = await vectorStore.similaritySearchWithScore(question, 3);

    // console.log("vectorStoreResult", vectorStoreResult);

    await chain.call({
      input: sanitizedQuestion,
      context: [],
      history: JSON.stringify(maintainedChatHistory),
      immediate_history: windowMemory,
    });

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
