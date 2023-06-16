import React, { useState, useRef } from 'react';
import FileUploadForm from '../../components/FileUploadForm';
import axios from 'axios';
import LoadingBar from 'react-top-loading-bar';
import styles from './UploadAndTrain.module.css';

const UploadAndTrain = ({ clientName }) => {
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const handleTrainClick = async () => {
    setLoading(true);
    ref.current.continuousStart();
    try {
      const response = await axios.get(`/api/train/${clientName}`);
      console.log(response.data);
      if (response.data === 'Ingestion process completed successfully') {
        ref.current.complete();
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upload and Train for {clientName}</h1>
      <FileUploadForm clientName={clientName} />
      <button onClick={handleTrainClick} disabled={loading} className={styles.trainButton}>
        Train Model
      </button>
      <LoadingBar color='#f11946' ref={ref} />
    </div>
  );
};

export async function getServerSideProps(context) {
  // Replace this with your actual function to get the client name
  const { client } = context.query;
  return {
    props: {
      clientName: client,
    },
  };
}

export default UploadAndTrain;
