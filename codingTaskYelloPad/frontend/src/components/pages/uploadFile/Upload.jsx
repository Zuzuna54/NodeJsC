import React, { useState, useEffect } from "react";
import { uploadFile, searchWord, getFileNames } from "../../../axios/customAxios";
import "./Upload.scss";

const FileUploader = () => {

    // State to track the file selected by the user
    const [file, setFile] = useState(null);
    const [fileNames, setFileNames] = useState([]);
    const [selectedFileName, setSelectedFileName] = useState(''); // State to track selected file from dropdown
    const [searchWordInput, setSearchWordInput] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('accessToken');

    // Function to handle file selection by the user
    const handleFileChange = (e) => {

        setFile(e.target.files[0]);

    };

    // Function to handle file upload
    const handleUpload = async () => {

        if (!file) {

            setError("Please select a file to upload.");
            return;

        }

        setLoading(true);
        setError(null);

        try {

            const formData = new FormData();
            formData.append('file', file);
            await uploadFile(formData, token).then(res => {

                fetchFileNames(); // Refetch filenames after successful upload
                setSearchWordInput(''); // Clear the search word input after upload
                setSearchResult(null); // Optionally clear the previous search results if needed
                setError(null);

            }).catch(err => {

                setError('Failed to upload file: ' + err.message);

            });

        } catch (err) {

            setError('Failed to upload file: ' + err.message);

        } finally {

            setLoading(false);

        }

    };

    // Function to handle file selection from dropdown
    const handleFileSelection = (e) => {

        setSelectedFileName(e.target.value);

    };

    // Function to handle search for a word in the selected file
    const handleSearch = async () => {

        setLoading(true);
        setError(null);

        try {

            const response = await searchWord({ word: searchWordInput, file_name: selectedFileName }, token);
            setSearchResult(response.data);
            if (!response.data || response.data.wordCount === 0) {

                setError("No results found for your search.");

            }

        } catch (err) {

            setError('Failed to search for word: ' + err.message);

        } finally {

            setLoading(false);

        }

    };

    // Function to generate CSV file for search results
    const generateCSV = () => {

        if (!searchResult) return;

        const csvContent = `Word: ${searchWordInput}, Word-Count: ${searchResult.wordCount}, Sentences:"${searchResult.sentences.join(' ')}"`;
        const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "search_result.csv");
        document.body.appendChild(link);
        link.click();

    };

    // Highlight the word and generaete the html content 
    const hightlightWord = (sentence, word) => {

        const words = sentence.split(' ');
        const highlightedWords = words.map(w => {

            return w.toLowerCase() === word.toLowerCase() ? <span className="highlighted" key={w + Math.random()}>{w}</span> : w + ' ';

        });

        return highlightedWords;

    }

    // Function to fetch file names
    const fetchFileNames = async () => {

        try {

            await getFileNames(token).then(res => {

                //filter data for only unique values
                const uniqueFileNames = [...new Set(res.data.data)];
                setFileNames(res.data.data);

            }).catch(err => {
                setError('Failed to fetch file names: ' + err.message);
            });

        } catch (err) {
            console.error('Failed to fetch file names: ' + err.message);
        }

    };

    // Fetch file names on component mount and when token changes
    useEffect(() => {

        fetchFileNames();

    }, [token]); // Fetch file names on component mount and when token changes

    // Render the file uploader component
    return (
        <div className="file-uploader">
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>Upload</button>
            {fileNames.length > 0 && (
                <select value={selectedFileName} onChange={handleFileSelection} disabled={loading}>
                    <option value="">Select a file</option>
                    {fileNames.map((fileName, index) => (
                        <option key={index} value={fileName}>{fileName}</option>
                    ))}
                </select>
            )}
            {selectedFileName && (
                <>
                    <input type="text" value={searchWordInput} onChange={(e) => setSearchWordInput(e.target.value)} disabled={loading} />
                    <button onClick={handleSearch} disabled={!searchWordInput || loading}>Search</button>
                </>
            )}
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {searchResult && searchResult.wordCount > 0 && (
                <div>
                    <h2>Search Result</h2>
                    <p>Word Count: {searchResult.wordCount}</p>
                    <h3>Sentences:</h3>
                    <ul>
                        {searchResult.sentences.map((sentence, index) => (
                            <li key={index}>{hightlightWord(sentence, searchWordInput)}</li>
                        ))}
                    </ul>
                    <button onClick={generateCSV}>Download CSV</button>
                </div>
            )}
        </div>
    );
};

// Export the file uploader component
export default FileUploader;
