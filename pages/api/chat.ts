import path from "path";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import { LLMChain, ConversationalRetrievalQAChain, RefineDocumentsChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CallbackManager } from "langchain/callbacks";
import { ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { BufferWindowMemory } from 'langchain/memory';



export default async function handler(req: any, res: any) {
  const { question, history, client } = req.body;

  //   if (!question) {
  //     return res.status(400).json({ message: "No question in the request" });
  //   }

  //   const originalDir = process.cwd();
  //   process.chdir(originalDir);

  //   const sanitizedQuestion = question.trim().replace("\n");
  //   const clientFolder = client;
  //   const dir = path.resolve(process.cwd(), "data", "clients", clientFolder, "data");

  //   try {
  //     const vectorstore = await HNSWLib.load(dir, new OpenAIEmbeddings());
  //     const model = new ChatOpenAI({
  //       temperature: 0,
  //       maxTokens: 2500,
  //       maxRetries: 5,
  //       modelName: 'gpt-3.5-turbo',
  //       streaming: true,
  //       callbackManager: CallbackManager.fromHandlers({
  //         // This function is called when the LLM generates a new token (i.e., a prediction for the next word)
  //         async handleLLMNewToken(token: string) {
  //           // Write the token to the output stream (i.e., the console)
  //           onTokenStream(token);
  //         },
  //       }),
  //     });


  //     const systemPrompt = SystemMessagePromptTemplate.fromTemplate(oneLine`
  //   ${systemPromptTemplate}
  // `);



  const systemPromptTemplate = `You are an AI assistant called STCBOT and a world-class Movie and TV Shows Expert.
You will answer questions, lead the conversation, and recommend content such as movies, series, TV shows, and documentaries to users based on their interests.
Some chat history is provided as Text don't output this text. Don't preface your answer with "AI:" or "As an AI assistant".
You have access to the chat history with the user (CHATHISTORY/MEMORY) and to context (RELEVANTDOCS) provided by the user.
When answering, consider whether the question refers to something in the MEMORY or CHATHISTORY before checking the RELEVANTDOCS.
Don’t justify your answers. Don't refer to yourself in any of the created content.
You can suggest the content by using the following format [movie_name](link_to_movie) or [TV_Show_name](link_to_TV_Show)
Don't recommend content that is not related to the RELEVANTDOCS.
Any recommendation must be atatched with Poster you will find in the RELEVANTDOCS in image tag <a href="link_to_movie or link_to_TV_Show"><img width="200" style="margin-top:20px; display:block; margin-bottom:10px; border-radius: 10px" height="300" src="" /></a>.
Answer the input in the same language it was asked in.

Follow Up Input: {input}

RELEVANTDOCS: {context}

`;

  const systemPrompt = SystemMessagePromptTemplate.fromTemplate(systemPromptTemplate);

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    systemPrompt,
    HumanMessagePromptTemplate.fromTemplate('QUESTION: """{input}"""'),
  ]);


  const windowMemory: any = BufferWindowMemory;

  const originalDir = process.cwd();
  process.chdir(originalDir);

  const sanitizedQuestion = question.trim().replace("\n");
  const clientFolder = client;
  const dir = path.resolve(process.cwd(), "data", "clients", clientFolder, "data");


  try {
    // const vectorstore = await HNSWLib.load(dir, new OpenAIEmbeddings());
    const llm = new ChatOpenAI({
      temperature: 0,
      maxTokens: 3000,
      maxRetries: 5,
      modelName: 'gpt-3.5-turbo',
      streaming: true,
      callbackManager: CallbackManager.fromHandlers({
        // This function is called when the LLM generates a new token (i.e., a prediction for the next word)
        async handleLLMNewToken(token: string) {
          // Write the token to the output stream (i.e., the console)
          onTokenStream(token);
        },
      }),
    });
    const chain = new LLMChain({
      prompt: chatPrompt,
      // memory: windowMemory,
      llm,
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });

    const vectorStore = await HNSWLib.load(dir, new OpenAIEmbeddings());
    const vectorStoreResult = await vectorStore.similaritySearch(question, 1);
    await chain.call({
      input: question,
      context: JSON.stringify(vectorStoreResult),
      history,
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
