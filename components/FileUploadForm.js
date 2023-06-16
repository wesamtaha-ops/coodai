import axios from 'axios';
import { useState } from 'react';
import styles from './FileUploadForm.module.css';

const FileUploadForm = ({ clientName }) => {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [uploading, setUploading] = useState(false);

    const onFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };


    const onFileUpload = async () => {
        const formData = new FormData();

        Array.from(selectedFiles).forEach((file) => {
            formData.append('files', file);
        });

        setUploading(true);

        try {
            console.log('Uploading files...');
            await axios.post(`/api/upload/${clientName}`, formData);
            alert('Files uploaded successfully');
        } catch (error) {
            console.error(error);
            alert('There was an error uploading your files');
        }

        setUploading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.fileUpload}>
                <input
                    type="file"
                    multiple
                    onChange={onFileChange}
                    className={styles.fileInput}
                    disabled={uploading}
                />
                <button
                    onClick={onFileUpload}
                    disabled={uploading || !selectedFiles}
                    className={styles.uploadButton}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </div>
    );
};

export default FileUploadForm;
