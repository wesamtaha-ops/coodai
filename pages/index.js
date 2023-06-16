import { useState, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import remarkGfm from 'remark-gfm';

export default function Home({ initialClient }) {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState(initialClient);
  const [messageState, setMessageState] = useState({
    messages: [
      {
        message:
          client === 'quran'
            ? 'السلام عليكم .. أنا مساعدك الشخصي في الأمور الدينية الحياتية العامة يمكنك سؤالي عن أي شيء يتعلق في تفسير القرآن والحديث الشريف فقد تم تدريبي على التفسير وعلى صحيح البخاري ومسلم .. يرجى العلم أنني لست مؤهلا للفتوى ولست مرجع ديني فأنا فقط معالج لغوي أعطيك المعلومة بشكل مبسط'
            : "Hi, I'm " + client + " AI assistant for Your Data. How can I help you?",
        type: 'apiMessage',
      },
    ],
    pending: undefined,
    history: [],
  });
  const { messages, pending, history } = messageState;

  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [pending]);

  // Focus on text field on load
  useEffect(() => {
    textAreaRef.current?.focus();
  }, [loading]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const question = userInput.trim();
    if (question === '') {
      return;
    }

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      pending: undefined,
    }));

    setLoading(true);
    setUserInput('');
    setMessageState((state) => ({ ...state, pending: '' }));

    const ctrl = new AbortController();

    fetchEventSource('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        history,
        client,
      }),
      signal: ctrl.signal,
      onmessage: (event) => {
        if (event.data === '[DONE]') {
          setMessageState((state) => ({
            history: [...state.history, [question, state.pending || '']],
            messages: [
              ...state.messages,
              {
                type: 'apiMessage',
                message: state.pending || '',
              },
            ],
            pending: undefined,
          }));
          setLoading(false);
          ctrl.abort();
        } else {
          const data = JSON.parse(event.data);
          setMessageState((state) => ({
            ...state,
            pending: (state.pending || '') + data.data,
          }));
        }
      },
    });
  };

  // Prevent blank submissions and allow for multiline input
  const handleEnter = (e) => {
    if (e.key === 'Enter' && userInput) {
      if (!e.shiftKey && userInput) {
        handleSubmit(e);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const chatMessages = useMemo(() => {
    return [...messages, ...(pending ? [{ type: 'apiMessage', message: pending }] : [])];
  }, [messages, pending]);

  return (
    <>
      <Head>
        {/* <!-- Primary Meta Tags --> */}
        <title>{[client, ' ChatBOT', ' AI']}</title>

        <meta name="title" content="Chat Your Data" />
        <meta name="description" content="Using AI to ask questions of your data" />

        {/* <!-- Open Graph / Facebook --> */}

        {/* <!-- Twitter --> */}

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {chatMessages.map((message, index) => {
              let icon;
              let className;

              if (message.type === 'apiMessage') {
                icon = (
                  <Image
                    src="/chatIcon.png"
                    alt="AI"
                    width="30"
                    height="30"
                    className={styles.boticon}
                    priority
                  />
                );
                className = styles.apimessage;
              } else {
                icon = (
                  <Image
                    src="/usericon.png"
                    alt="Me"
                    width="30"
                    height="30"
                    className={styles.usericon}
                    priority
                  />
                );

                // The latest message sent by the user will be animated while waiting for a response
                className =
                  loading && index === chatMessages.length - 1
                    ? styles.usermessagewaiting
                    : styles.usermessage;
              }
              return (
                <div key={index} className={className}>
                  {icon}
                  <div className={styles.markdownanswer}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget="_blank">
                      {message.message}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                maxLength={512}
                id="userInput"
                name="userInput"
                placeholder={loading ? 'Waiting for response...' : 'Type your question...'}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className={styles.textarea}
              />
              <button
                type="submit"
                disabled={loading}
                className={styles.generatebutton}
              >
                {loading ? (
                  <div className={styles.loadingwheel}>
                    <CircularProgress color="inherit" size={20} />
                  </div>
                ) : (
                  // Send icon SVG in input field
                  <svg
                    viewBox="0 0 20 20"
                    className={styles.svgicon}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
          <div className={styles.footer}>
            <p> </p>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const { client } = context.query;
  return {
    props: {
      initialClient: client || '',
    },
  };
}
