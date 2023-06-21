import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './WebParserForm.module.css';

const WebParserForm = ({ clientName }) => {
  const [urls, setUrls] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await axios.get(`/api/urls/${clientName}`);
      console.log(response.data.data);
      setUrls(response.data && response.data.data && response.data.data.length ? response.data.data : []);
    } catch (error) {
      console.error(error);
      setError('Error fetching URLs.');
    }
  };

  const addUrl = async () => {
    if (textInput.trim() === '') return;

    if (!isValidUrl(textInput.trim())) {
      setError('Invalid URL. Please enter a valid URL.');
      return;
    }

    if (urls.includes(textInput.trim())) {
      setError('URL already exists. Please enter a unique URL.');
      return;
    }

    const newUrls = urls && urls.length ? [...urls, textInput.trim()] : [textInput.trim()];
    setUrls(newUrls);
    setTextInput('');
    try {
      await axios.post(`/api/urls/${clientName}`, { urls: newUrls });
    } catch (error) {
      console.error(error);
      setError('Error updating URLs.');
    }
  };

  const updateUrl = async (index, updatedUrl) => {
    const newUrls = [...urls];
    newUrls[index] = updatedUrl;
    setUrls(newUrls);

    try {
      await axios.post(`/api/urls/${clientName}`, { urls: newUrls });
    } catch (error) {
      console.error(error);
      setError('Error updating URLs.');
    }
  };

  const removeUrl = async (index) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);

    try {
      await axios.delete(`/api/urls/${clientName}?lineIndex=${index}`);
    } catch (error) {
      console.error(error);
      setError('Error removing URL.');
    }
  };

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
    setError('');
  };

  const handleUrlChange = (event, index) => {
    const updatedUrl = event.target.value;
    updateUrl(index, updatedUrl);
  };

  const isValidUrl = (url) => {
    // Regular expression to validate URL format
    const urlRegex = /^(http[s]?|ftp):\/\/[^ "]+$/;
    return urlRegex.test(url);
  };

  return (
    <div className={styles.container}>

      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.form}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={textInput}
            onChange={handleTextInputChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                addUrl();
              }
            }}
            placeholder="Enter URL"
          />
          <button onClick={addUrl} className={styles.button}>Add</button>
        </div>


        <div className={styles.urlsContainer}>
          <br />
          <h5 className='title' style={{
            color: '#000',
            marginBottom: '10px',
          }} >Included Links</h5>

          {urls.map((url, index) => (
            <div key={index} className={styles.urlItem}>
              <input
                type="text"
                value={url}
                onChange={(event) => handleUrlChange(event, index)}
              />
              <button onClick={() => removeUrl(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WebParserForm;
