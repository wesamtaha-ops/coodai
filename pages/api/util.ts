import { LLMChain, loadQAChain, ChatVectorDBQAChain, RefineDocumentsChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores";
import { ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { CallbackManager } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models";

const QA_PROMPT = PromptTemplate.fromTemplate(`{question}`);

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`
  You are an AI assistant For STCTV, Your job is to recommend a movie or TV Show based on the uploaded data and input that indexed on platform.
  Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
  Please commit to the provided data. don't recommend content that is not related to the indexed data and don't make up data.
  you can start the conversation by greeting the user then prompt the user to ask him what he want to watch don't recommend anything in advance.
  The content you recommend Should be from the index of movies and TV Shows Only. don't recommend content outside the index or similer.
  the name and the link and poster you offer of the movie or TV Show should be in the same context.
  don't offer from outside the context. I don't want content from External sources or from the internet.
  If the question is in Arabic Please answer in Arabic. Don't answer in English.  
  don't recommend content that is not related to the provided data.
 Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const CHAT_PROMPT = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `Task: 
    I want you to act as a Movies and TV shows expert you will recommend movies and TV Shows to me. The content you recommend Should be from the index of movies and TV Shows Only. don't recommend content outside the uploaded data. 
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





export const makeChain = (
  vectorstore: HNSWLib,
  onTokenStream?: (token: string) => void
) => {

  const questionGenerator = new LLMChain({
    llm: new ChatOpenAI({ temperature: 0 }),
    prompt: CONDENSE_PROMPT,
  });

  const docChain = loadQAChain(
    new ChatOpenAI({
      temperature: 0,
      maxTokens: 3000,
      maxRetries: 5,
      cache: true,
      modelName: 'gpt-3.5-turbo', //change this to older versions (e.g. gpt-3.5-turbo) if you don't have access to gpt-4
      streaming: true,
      callbackManager: onTokenStream
        ? CallbackManager.fromHandlers({
          async handleLLMNewToken(token) {
            onTokenStream(token);
            // console.log(token);
          },
        })
        : undefined,
    }),
    { prompt: CHAT_PROMPT }
  );

  const refineDocumentsChain = new RefineDocumentsChain(docChain, vectorstore);


  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: refineDocumentsChain,
    questionGeneratorChain: questionGenerator,
    // returnSourceDocuments: true,
    // k: 1, // number of source documents to return

  });
}

