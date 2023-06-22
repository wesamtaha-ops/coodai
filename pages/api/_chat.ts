import path from "path";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { BufferMemory } from "langchain/memory";
import { LLMChain, ConversationalRetrievalQAChain, RefineDocumentsChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models";
import { CallbackManager } from "langchain/callbacks";
import { ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";


const systemPromptTemplate = `You are an AI assistant called STCBOT and a world-class Movie and TV Shows Expert.
You will answer questions, lead the conversation, and recommend content such as movies, series, TV shows, and documentaries to users based on their interests.
Some chat history is provided as Text; don't output this text. Don't preface your answer with "AI:" or "As an AI assistant".
You have access to the chat history with the user (CHATHISTORY/MEMORY) and to context (RELEVANTDOCS) provided by the user.
When answering, consider whether the question refers to something in the MEMORY or CHATHISTORY before checking the RELEVANTDOCS.
Don’t justify your answers. Don't refer to yourself in any of the created content.
Don't recommend content that is not related to the RELEVANTDOCS.
Answer the question in the same language it was asked in.

RELEVANTDOCS: {context}

CHATHISTORY: {history}

MEMORY: {immediate_history}`;

const systemPrompt = SystemMessagePromptTemplate.fromTemplate(systemPromptTemplate);

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  systemPrompt,
  HumanMessagePromptTemplate.fromTemplateformat_prompt(input_language = "English", output_language = "French", text = "I love programming.").to_messages(),




]);

export default async function handler(req: any, res: any) {
  const { question, history, client } = req.body;

  if (!question) {
    return res.status(400).json({ message: "No question in the request" });
  }

  const originalDir = process.cwd();
  process.chdir(originalDir);

  const sanitizedQuestion = question.trim().replace("\n");
  const clientFolder = client;
  const dir = path.resolve(process.cwd(), "data", "clients", clientFolder, "data");

  try {
    const vectorstore = await HNSWLib.load(dir, new OpenAIEmbeddings());
    const model = new ChatOpenAI({
      temperature: 0,
      maxTokens: 2500,
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


    const systemPrompt = SystemMessagePromptTemplate.fromTemplate(oneLine`
  ${systemPromptTemplate}
`);

    const retriever = vectorstore.asRetriever();
    const chain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
      questionGeneratorChainOptions: {
        llm: new ChatOpenAI({
          modelName: "gpt-3.5-turbo",
        }),
        template: `Any recommendation must be atatched with Poster in image tag <a href="link_to_movie or link_to_TV_Show"><img width="200" style="margin-top:20px; display:block; margin-bottom:10px; border-radius: 10px" height="300" src="" /></a>.`
      },
      qaChainOptions: {
        type: 'refine'
      },
      returnSourceDocuments: true
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });

    await chain.call({
      question: question
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
