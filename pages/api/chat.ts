import path from "path";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { BufferMemory } from "langchain/memory";
import { LLMChain, ConversationalRetrievalQAChain, RefineDocumentsChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models";
import { CallbackManager } from "langchain/callbacks";
import { ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";


const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`I want you to act as a Movies and TV shows expert you will recommend movies and TV Shows to me. The content you recommend Should be from the index of movies and TV Shows Only. don't recommend content outside the uploaded data. 
  Topic: Please include the reason for your recommendation in your answer. The reason should be related to the user's request.  don't recommend anything in advance without the user asking for it.
  Tone: Confident
  Audience: 30-year old
  Format: markdown
The context is between two '========='.
Don't recommend content that is not related to the indexed data. and do not recommend more than two content.
the name and the link and poster should be in the same context.
You can suggest the content by using the following format [movie_name](link_to_movie) or [TV_Show_name](link_to_TV_Show)
Any recommendation must be atatched with Poster in image tag <a href="link_to_movie or link_to_TV_Show"><img width="200" style="margin-top:20px; display:block; margin-bottom:10px; border-radius: 10px" height="300" src="" /></a>.
If the question is in Arabic Please answer in Arabic. Don't answer in English.  
don't offer from outside the context. I don't want content from External sources or from the internet.
don't recommend content that is not related to the provided data if its not in the index say that you don't have it.
=========
{context}
=========
 Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);


const CHAT_PROMPT = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `Task: 
    I want you to act as a Coffee your name is WESAMOO expert you will recommend movies and TV Shows to me. The content you recommend Should be from the index of movies and TV Shows Only. don't recommend content outside the uploaded data. 
    Topic: Please include the reason for your recommendation in your answer. The reason should be related to the user's request.  don't recommend anything in advance without the user asking for it.
    Tone: Confident
    Audience: 30-year old
    Format: markdown
The context is between two '========='.
Don't recommend content that is not related to the indexed data. and do not recommend more than two content.
the name and the link and poster should be in the same context.
You can suggest the content by using the following format [movie_name](link_to_movie) or [TV_Show_name](link_to_TV_Show)
Any recommendation must be atatched with Poster in image tag <a href="link_to_movie or link_to_TV_Show"><img width="200" style="margin-top:20px; display:block; margin-bottom:10px; border-radius: 10px" height="300" src="" /></a>.
If the question is in Arabic Please answer in Arabic. Don't answer in English.  
don't offer from outside the context. I don't want content from External sources or from the internet.
don't recommend content that is not related to the provided data if its not in the index say that you don't have it.
=========
{context}
=========` ),
  HumanMessagePromptTemplate.fromTemplate("{question}"),
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
      callbackManager: onTokenStream
        ? CallbackManager.fromHandlers({
          async handleLLMNewToken(token) {
            onTokenStream(token);
          },
        })
        : undefined,
    });

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
      question: question, chat_history: history
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
