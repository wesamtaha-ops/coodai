import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUploadForm from '../../../components/FileUploadForm';
import QuestionAnswersForm from '../../../components/QuestionAnswersForm';
import WebParserForm from '../../../components/WebParserForm';
import ChatScreen from '../../../components/ChatScreen';
import axios from 'axios';
import LoadingBar from 'react-top-loading-bar';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import styles from './../UploadAndTrain.module.css';
import SettingsForm from '../../../components/SettingsForm';
import Navbar from '../../../components/layout/Navbar';

const UploadAndTrain = ({ clientName, botName }) => {
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
      const response = await axios.get(`/api/files/${clientName}/${botName}`);
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
      const response = await axios.get(`/api/train/${clientName}/${botName}`);
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
    <>
      <Navbar clientFolder={clientName} />
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#f1f5f9',
        paddingTop: '50px',
        paddingBottom: '50px'
      }}>
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
                      Upload your documents to train the AI for {botName}, You Can Upload  PDF, WORD, CSV and TXT Files
                    </h1>
                  </div>
                  <FileUploadForm
                    setDirectoryEmpty={setDirectoryEmpty}
                    directoryEmpty={directoryEmpty}
                    botName={botName}
                    clientName={clientName}
                  />
                </div>
              </TabPanel>
              <TabPanel className={`${styles.subtabPanel} ${selectedSubTab === 1 ? styles.active : ''}`}>
                <div className={styles.fileUploadForm}>
                  <div className={styles.fileManager}>
                    <h1 className={styles.title}>
                      Your AI Bot can learn from your Website, You add multiple URLs pages and subpages and JSON API.
                    </h1>
                  </div>
                  <WebParserForm botName={botName} clientName={clientName} />
                </div>
              </TabPanel>
              <TabPanel className={`${styles.subtabPanel} ${selectedSubTab === 2 ? styles.active : ''}`}>
                <div className={styles.fileUploadForm}>
                  <div className={styles.fileManager}>
                    <h1 className={styles.title}>
                      Your AI Bot can learn from list of Questions and Answers
                    </h1>
                  </div>
                  <QuestionAnswersForm clientName={clientName} botName={botName} />
                </div>
              </TabPanel>
            </Tabs>


            <button
              onClick={handleTrainClick}
              disabled={loading}
              className={`${styles.trainButton} ${loading ? styles.disabled : ''}`}
            >
              {training ? 'Learning... It might take a few minutes' : 'Train it now !'}
            </button>
          </TabPanel>

          <TabPanel
            className={`${styles.tabPanel} ${selectedTab === 1 ? styles.active : ''}`}
          >
            <h2>Settings</h2>
            <br />
            <SettingsForm clientFolder={clientName} botName={botName} />

          </TabPanel>

          <TabPanel
            className={`${styles.tabPanel} ${selectedTab === 2 ? styles.active : ''}`}
          >
            <h2>Preview</h2>
            <br />
            <ChatScreen preview={true} clientName={clientName} botName={botName} />
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
    </>
  );
};

export async function getServerSideProps(context) {
  // Replace this with your actual function to get the client name
  const { client, bot } = context.query;
  return {
    props: {
      botName: bot,
      clientName: client,
    },
  };
}

export default UploadAndTrain;
