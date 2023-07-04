import { useState, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';
import styles from './ChatScreen.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'
import axios from 'axios';

export default function ChatScreen({ initialClient, preview }) {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState(initialClient);
    const [messageState, setMessageState] = useState({
        messages: [
            {
                message: "Hi, I'm <b style='color: blueviolet;' >" + client.toUpperCase() + " AI </b> I am here to assist you with any questions or recommendations. <br /> How can I help you today?",
                type: 'apiMessage',
            },
        ],
        pending: undefined,
        history: [],
    });
    const { messages, pending, history } = messageState;

    const messageListRef = useRef(null);
    const textAreaRef = useRef(null);
    const [settings, setSettings] = useState([]);
    const [error, setError] = useState('');
    const [clientName, setClientName] = useState(initialClient);


    const fetchUrls = async () => {
        try {
            const response = await axios.get(`/api/urls/${clientName}?file=settings.json`);
            setSettings(response.data.data);
            console.log(response.data.data);
        } catch (error) {
            console.error(error);
            setError('Error fetching URLs.');
        }
    };

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

    // Focus on text field on load
    useEffect(() => {
        fetchUrls();
    }, []);
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
                settings
            }),
            signal: ctrl.signal,
            onmessage: (event) => {
                console.log(event.data);
                if (event.data === '{"data":"[DONE]"}') {

                    // 

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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link href="https://fonts.googleapis.com/css2?family=Almarai&display=swap" rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main} style={{ backgroundColor: settings.mainBG || '#f9f9f9', fontFamily: settings.mainFont || 'Arial', borderRadius: preview ? 20 : 0, height: preview ? 'auto' : '100vh' }} >
                <div className={styles.cloud} style={{ width: preview ? '100%' : '85vw', height: preview ? 500 : 'initial' }} >
                    <div ref={messageListRef} className={styles.messagelist} style={{ height: preview ? '100%' : '80vh' }}  >
                        {chatMessages.map((message, index) => {
                            let icon;
                            let className;

                            if (message.type === 'apiMessage') {
                                icon = (
                                    <Image
                                        src={settings.chatIcon || "/chatIcon.png"}
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
                                        src={settings.userIcon || "https://cdn.jawwy.tv/9/avatar-smile.svg"}
                                        alt="Me"
                                        width="35"
                                        height="35"
                                        className={styles.usericon}
                                        style={{ backgroundColor: settings.userIconColor || '#f9f9f9' }}
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
                                <div


                                    key={index} className={className} style={{
                                        color: message.type !== 'apiMessage' ? settings.userMessageColor : settings.systemMessageColor,
                                        backgroundColor: message.type !== 'apiMessage' ? settings.userMessageBG : settings.systemMessageBG,
                                        maxWidth: preview ? '90%' : '80%', fontSize: preview ? '15px' : '16px'
                                    }}>
                                    {icon}
                                    <div className={styles.markdownanswer} style={{
                                        color: message.type !== 'apiMessage' ? settings.userMessageColor : settings.systemMessageColor,
                                        backgroundColor: message.type !== 'apiMessage' ? settings.userMessageBG : settings.systemMessageBG,
                                        fontFamily: settings.mainFont || 'Arial'
                                    }}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            linkTarget="_blank"
                                            escapeHtml={false}
                                            rehypePlugins={[rehypeRaw]}
                                        >
                                            {message.message}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.center} style={{ width: preview ? '140%' : 'auto' }}>
                    <div className={styles.cloudform} style={{ width: preview ? '70%' : '100%' }}>
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
                                placeholder={loading ? 'I am thinking Please Wait...' : 'Type your question...'}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className={styles.textarea}
                                style={{ backgroundColor: settings.promptBG || '#F1F1F1', color: settings.promptColor || '#000000', fontFamily: settings.mainFont || 'Arial', width: preview ? '100%' : 'calc(100vw - 100px)' }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.generatebutton} style={{ backgroundColor: settings.submitBG || '#0084FF' }}
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
