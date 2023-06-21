import { useState, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'
import axios from 'axios';
import ChatScreen from '../components/ChatScreen';

export default function Home({ initialClient }) {
  const [client, setClient] = useState(initialClient);
  return (
    <>
      <ChatScreen preview={false} initialClient={initialClient} />
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
