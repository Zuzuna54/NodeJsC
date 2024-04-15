import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { getUploadedFilesHistory } from '../../../axios/customAxios';
import './History.scss';

const History = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoadingState] = useState(false);
    const [error, setErrorState] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchUploadedFiles = async () => {
            setLoadingState(true);
            setErrorState(null);
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await getUploadedFilesHistory(accessToken);
                if (Array.isArray(response?.data.history)) {
                    setUploadedFiles(response.data.history);
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

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Unknown date';
        try {
            return format(parseISO(dateStr), 'MM/dd/yyyy');
        } catch (error) {
            console.error('Error formatting date:', error.message);
            return 'Invalid date';
        }
    };

    const generateCSV = (data) => {
        const headers = "File Name,Date,Word,Word Count,Content\n";
        const csvRows = data.map(file =>
            `"${file.fileName}",${formatDate(file.date)},"${file.word}",${file.wordCount},"${file.content.replace(/"/g, '""')}"` // Ensure CSV compliance
        ).join('\n');

        const csvData = headers + csvRows;
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'UploadedFilesHistory.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate the number of pages
    const pageCount = Math.ceil(uploadedFiles.length / itemsPerPage);

    // Get current page of items
    const currentItems = uploadedFiles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const changePage = (offset) => {
        setCurrentPage(prev => Math.max(1, Math.min(prev + offset, pageCount)));
    };

    return (
        <div className="history-container">
            <h1>Uploaded Files History</h1>
            {loading && <div>Loading...</div>}
            {error && <div className="error-message">{error}</div>}
            <div className="uploaded-files">
                {currentItems.map((file, index) => (
                    <div className="file" key={index}>
                        <div className="file-info">
                            <span className="file-name">{file.fileName}</span>
                            <span className="file-date">{formatDate(file.date)}</span>
                            <span className="word-info">Word: {file.word} ({file.wordCount} times)</span>
                            <button onClick={() => generateCSV([file])}>Download CSV</button>
                        </div>
                    </div>
                ))}
                {uploadedFiles.length > 0 &&
                    <button onClick={() => generateCSV(uploadedFiles)} style={{ marginTop: '20px' }}>
                        Download All as CSV
                    </button>
                }
            </div>
            <div className="pagination">
                <button onClick={() => changePage(-1)} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {pageCount}</span>
                <button onClick={() => changePage(1)} disabled={currentPage === pageCount}>Next</button>
            </div>
        </div>
    );
};

export default History;
