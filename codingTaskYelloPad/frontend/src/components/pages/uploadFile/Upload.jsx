import React, { useState } from "react";
import { uploadFile, searchWord } from "../../../axios/customAxios";
import "./Upload.scss";

const FileUploader = () => {
    const [file, setFile] = useState(null);
    const [searchWordIput, setSearchWordInput] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileUploaded, setFileUploaded] = useState(false); // New state for file upload status
    const [uploadedFileName, setUploadedFileName] = useState(''); // New state for uploaded file name

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSearchChange = (e) => {
        setSearchWordInput(e.target.value);
    };

    const handleUpload = async () => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await uploadFile(formData);
            setFileUploaded(true);
            console.log(response.data);
            setUploadedFileName(response.data.fileName); // Set the uploaded file name
        } catch (err) {
            setError('Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await searchWord({ word: searchWordIput, file_name: uploadedFileName }); // Pass the uploaded file name
            setSearchResult(response.data);
            console.log(response.data);
        } catch (err) {
            setError('Failed to search for word');
        } finally {
            setLoading(false);
        }
    };

    const generateCSV = () => {
        if (!searchResult) return;

        const csvContent = `Word: "${searchWordIput}", Word-Count: ${searchResult.wordCount}, Sentences:"${searchResult.sentences.join(' ')}"`;
        const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "search_result.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="file-uploader">
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {fileUploaded && (
                <>
                    <input type="text" value={searchWordIput} onChange={handleSearchChange} />
                    <button onClick={handleSearch}>Search</button>
                </>
            )}
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {searchResult && (
                <div>
                    <h2>Search Result</h2>
                    <p>Word Count: {searchResult.wordCount}</p>
                    <h3>Sentences:</h3>
                    <ul>
                        {searchResult.sentences.map((sentence, index) => (
                            <li key={index}>{sentence}</li>
                        ))}
                    </ul>
                    <button onClick={generateCSV}>Download CSV</button>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
