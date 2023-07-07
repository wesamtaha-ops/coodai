import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faFileExcel, faFileWord, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import styles from './FileUploadForm.module.css';

import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import LoadingBar from 'react-top-loading-bar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileUploadForm = ({ directoryEmpty, setDirectoryEmpty, clientName }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingBarProgress, setLoadingBarProgress] = useState(0);
  const [error, setError] = useState('');

  const dropZoneRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`/api/files/${clientName}`);
      setFiles(response.data.files);
      setDirectoryEmpty(response.data.empty);
    } catch (error) {
      console.error(error);
      setError('Error fetching files.');
    }
  };

  const onFileChange = (event) => {
    const filesArray = Array.from(event.target.files);

    const allowedExtensions = ['pdf', 'docx', 'doc', 'csv', 'txt', 'json'];

    const filteredFiles = filesArray.filter((file) => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      return allowedExtensions.includes(fileExtension);
    });

    const invalidFiles = filesArray.filter((file) => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      return !allowedExtensions.includes(fileExtension);
    });

    setSelectedFiles([...selectedFiles, ...filteredFiles]);

    if (invalidFiles.length > 0) {
      const errorMessage = `File type not supported, it should be one of the following: ${allowedExtensions.join(',')}`;
      toast.error(errorMessage);
    }
  };


  const removeSelectedFile = (fileName) => {
    const updatedSelectedFiles = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles(updatedSelectedFiles);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    setUploading(true);
    setLoadingBarProgress(0);
    setError('');

    try {
      console.log('Uploading files...');
      await axios.post(`/api/upload/${clientName}`, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setLoadingBarProgress(progress);
        },
      });
      setLoadingBarProgress(100);
      setFiles([]);
      setSelectedFiles([]);
      await fetchFiles();
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error(error);
      setError('Error uploading files.');
      toast.error('Error uploading files');
    }

    setUploading(false);
    setLoadingBarProgress(0);
  };

  const deleteFile = async (fileName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the file '${fileName}'?`);
    if (!confirmDelete) return;

    try {
      console.log('Deleting file...');
      await axios.delete(`/api/files/${clientName}?fileName=${fileName}`);
      await fetchFiles();
      alert('File deleted successfully');
    } catch (error) {
      console.error(error);
      setError('Error deleting file.');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    dropZoneRef.current.classList.add(styles.dragging);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    dropZoneRef.current.classList.remove(styles.dragging);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dropZoneRef.current.classList.remove(styles.dragging);
    const filesArray = Array.from(event.dataTransfer.files);
    setSelectedFiles([...selectedFiles, ...filesArray]);
  };

  const getFileTypeIcon = (fileName) => {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return faFileExcel;
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      return faFileWord;
    } else if (fileExtension === 'pdf') {
      return faFilePdf;
    } else {
      return null; // No specific icon found, can add more cases if needed
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.fileManager}>
        <div className={styles.fileActions}>
          <input
            type="file"
            multiple
            onChange={onFileChange}
            className={styles.fileInput}
            disabled={uploading}
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className={styles.dropZone}
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={styles.uploadIcon}>+</div>
            <div className={styles.uploadText}>Drag and drop files here <br />or click to browse <br /><br />
              <span style={{ fontSize: 11, color: '#1877f2', marginTop: 20 }} > PDF, WORD, CSV, TXT only </span> </div>
          </label>
          <button
            onClick={uploadFiles}
            disabled={uploading || selectedFiles.length === 0}
            className={styles.uploadButton}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {selectedFiles.length > 0 && (
          <div className={styles.selectedFiles}>
            <h4 className={styles.h4}>Selected Files</h4>
            <ul className={styles.fileList}>
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  <span className={styles.fileName}>{file.name}</span>
                  <button
                    onClick={() => removeSelectedFile(file.name)}
                    className={styles.unselectButton}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {!directoryEmpty &&
        <div className={styles.fileManager}>
          <h4 className={styles.h4}>Already Included Files</h4>
          <ul className={styles.fileList}>
            {files.map((fileName, index) => {
              const fileIcon = getFileTypeIcon(fileName);
              return (
                <li key={index}>
                  {fileIcon && (
                    <FontAwesomeIcon icon={fileIcon} className={styles.fileIcon} />
                  )}
                  <span className={styles.fileName}>{fileName}</span>
                  <button onClick={() => deleteFile(fileName)} className={styles.deleteButton}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      }
      {loadingBarProgress > 0 && <LoadingBar progress={loadingBarProgress} />}
      {error && <div className={styles.error}>{error}</div>}
      <ToastContainer />
    </div>
  );
};

export default FileUploadForm;
