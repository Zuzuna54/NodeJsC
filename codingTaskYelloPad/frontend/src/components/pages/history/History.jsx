import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { getUploadedFilesHistory } from '../../../axios/customAxios';
import './History.scss';

const History = () => {
    const dispatch = useDispatch();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoadingState] = useState(false);
    const [error, setErrorState] = useState(null);

    useEffect(() => {
        const fetchUploadedFiles = async () => {
            try {
                setLoadingState(true);
                setErrorState(null);

                const accessToken = localStorage.getItem('accessToken');

                const response = await getUploadedFilesHistory(accessToken);

                if (Array.isArray(response?.data.files)) {
                    setUploadedFiles(response.data.files);
                } else {
                    console.error('Invalid data structure for uploaded files:', response?.data);
                    setErrorState('Invalid data structure for uploaded files');
                }
            } catch (error) {
                console.error('Error fetching uploaded files:', error.message);
                setErrorState('Error fetching uploaded files');
            } finally {
                setLoadingState(false);
            }
        };

        fetchUploadedFiles();
    }, []);

    const handleDownload = async (filename) => {
        try {

            const accessToken = localStorage.getItem('accessToken');
            const headers = {
                Authorization: `Bearer ${accessToken}`,
            };

            // await downloadCSV(filename, headers);
        } catch (error) {
            console.error('Error downloading CSV:', error.message);
            setErrorState('Error downloading CSV');
        }
    };

    return (
        <div className="history-container">
            <h1>Uploaded Files History</h1>
            {loading && <div>Loading...</div>}
            {error && <div className="error-message">{error}</div>}
            <div className="uploaded-files">
                {uploadedFiles.map((file, index) => (
                    <div className="file" key={index}>
                        <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-date">{format(new Date(file.uploadedAt), 'MM/dd/yyyy')}</span>
                        </div>
                        <button onClick={() => handleDownload(file.name)}>Download</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
