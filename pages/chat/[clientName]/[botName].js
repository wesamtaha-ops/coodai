import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../../../styles/Home.module.css'; // Adjust the path as per your project structure
import ReactMarkdown from 'react-markdown';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import axios from 'axios';
import ChatScreen from '../../../components/ChatScreen';
import Image from 'next/image';

export default function Home({ clientName, botName }) {
  const [client, setClient] = useState(clientName);
  const [bot, setBot] = useState(botName);

  return (
    <>
      <ChatScreen preview={false} clientName={clientName} botName={botName} />
    </>
  );
}

export async function getServerSideProps(context) {
  const { clientName, botName } = context.params;

  return {
    props: {
      clientName: clientName || '',
      botName: botName || '',
    },
  };
}
