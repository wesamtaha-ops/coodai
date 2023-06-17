import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUploadForm from '../../components/FileUploadForm';
import QuestionAnswersForm from '../../components/QuestionAnswersForm';
import WebParserForm from '../../components/WebParserForm';

import axios from 'axios';
import LoadingBar from 'react-top-loading-bar';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import styles from './UploadAndTrain.module.css';

const UploadAndTrain = ({ clientName }) => {
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [directoryEmpty, setDirectoryEmpty] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0); // Track the selected tab index
  const [selectedSubTab, setSelectedSubTab] = useState(0); // Track the selected tab index

  const ref = useRef(null);

  useEffect(() => {
    checkDirectory();
  }, []);

  const checkDirectory = async () => {
    try {
      const response = await axios.get(`/api/files/${clientName}`);
      const directoryExists = response.data.exists;
      const isEmpty = response.data.empty;
      setDirectoryEmpty(isEmpty);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTrainClick = async () => {
    setLoading(true);
    setTraining(true);
    ref.current.continuousStart();
    try {
      const response = await axios.get(`/api/train/${clientName}`);
      console.log(response.data);
      if (response.data === 'Ingestion process completed successfully') {
        ref.current.complete();
        setLoading(false);
        setTraining(false);
        toast.success('Training completed successfully');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setTraining(false);
      ref.current.complete();
      toast.error('Error occurred during training: ' + error);
    }
  };

  const handleTabSelect = (index) => {
    setSelectedTab(index);
  };

  const handleSubtabClick = (e, index) => {
    e.stopPropagation();
    setSelectedSubTab(index);
  };

  return (
    <div className={styles.container}>
      <Tabs
        className={styles.tabs}
        selectedIndex={selectedTab} // Set the selected tab index
        onSelect={handleTabSelect} // Handle tab selection
      >
        <TabList className={styles.tabList}>
          <Tab className={styles.tab} selectedClassName={styles.selectedTab}>
            Training Sources
          </Tab>
          <Tab className={styles.tab} selectedClassName={styles.selectedTab}>
            Settings
          </Tab>
          <Tab className={styles.tab} selectedClassName={styles.selectedTab}>
            Preview
          </Tab>
          <Tab className={styles.tab} selectedClassName={styles.selectedTab}>
            Publish
          </Tab>
        </TabList>

        <TabPanel
          className={`${styles.tabPanel} ${selectedTab === 0 ? styles.active : ''}`}
        >
          <Tabs
            className={styles.tabs}
            selectedIndex={selectedSubTab} // Set the selected tab index
            onSelect={handleSubtabClick} // Handle tab selection
          >
            <TabList className={styles.subtabList}>
              <Tab className={styles.tab} selectedClassName={styles.selectedSubTab} onClick={(e) => { handleSubtabClick(e, 0); }} >Documents</Tab>
              <Tab className={styles.tab} selectedClassName={styles.selectedSubTab} onClick={(e) => { handleSubtabClick(e, 1); }} >Web URLS</Tab>
              <Tab className={styles.tab} selectedClassName={styles.selectedSubTab} onClick={(e) => { handleSubtabClick(e, 2); }} >QA</Tab>
            </TabList>

            <TabPanel className={`${styles.subtabPanel} ${selectedSubTab === 0 ? styles.active : ''}`}>
              <div className={styles.fileUploadForm}>
                <div className={styles.fileManager}>
                  <h1 className={styles.title}>
                    Upload your documents to train the AI for {clientName}
                  </h1>
                </div>
                <FileUploadForm
                  setDirectoryEmpty={setDirectoryEmpty}
                  directoryEmpty={directoryEmpty}
                  clientName={clientName}
                />
              </div>
            </TabPanel>
            <TabPanel className={`${styles.subtabPanel} ${selectedSubTab === 1 ? styles.active : ''}`}>
              <h3>Content for Subtab 2</h3>
            </TabPanel>
            <TabPanel className={`${styles.subtabPanel} ${selectedSubTab === 2 ? styles.active : ''}`}>
              <h3>Content for Subtab 3</h3>
            </TabPanel>
          </Tabs>
          {/* <div className={styles.fileUploadForm}>
            <FileUploadForm
              setDirectoryEmpty={setDirectoryEmpty}
              directoryEmpty={directoryEmpty}
              clientName={clientName}
            />
          </div>
          <div className={styles.fileUploadForm}>
            <WebParserForm
              clientName={clientName}
            />
          </div>
          <div className={styles.fileUploadForm}>
            <QuestionAnswersForm
              clientName={clientName}
            />
          </div> */}

          {!directoryEmpty && (
            <button
              onClick={handleTrainClick}
              disabled={loading}
              className={`${styles.trainButton} ${loading ? styles.disabled : ''}`}
            >
              {training ? 'Learning... It might take a few minutes' : 'Train it!'}
            </button>
          )}
        </TabPanel>

        <TabPanel
          className={`${styles.tabPanel} ${selectedTab === 1 ? styles.active : ''}`}
        >
          <h2>Settings</h2>
          <p>This is the content for the Settings tab.</p>
        </TabPanel>

        <TabPanel
          className={`${styles.tabPanel} ${selectedTab === 2 ? styles.active : ''}`}
        >
          <h2>Preview</h2>
          <p>This is the content for the Preview tab.</p>
        </TabPanel>

        <TabPanel
          className={`${styles.tabPanel} ${selectedTab === 3 ? styles.active : ''}`}
        >
          <h2>Publish</h2>
          <p>This is the content for the Publish tab.</p>
        </TabPanel>

      </Tabs >
      <div className={styles.loadingBar}>
        <LoadingBar color="#f11946" ref={ref} />
      </div>
      <ToastContainer />
    </div >
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
