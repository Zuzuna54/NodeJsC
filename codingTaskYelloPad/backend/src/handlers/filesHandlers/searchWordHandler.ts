import { Request, Response } from "express";
import logger from "../../utils/Logger";
import { S3 } from "aws-sdk";
import { pool } from "../../services/db";

const s3 = new S3();

export const searchWordHandler = async (req: Request, res: Response): Promise<void> => {

    logger.info(`Initiating the searchWordHandler\n`);

    try {

        // Extract the word to search for from the request body or query parameters
        const { word, file_name } = req.body;

        if (!word) {
            res.status(400).send({ message: 'Word to search for is missing' });
            return;
        }

        // Retrieve the uploaded file content from S3
        const fileName = file_name;
        const fileContent = await getFileFromS3(fileName);

        // Perform the search for the word
        const wordCount = countOccurrences(fileContent, word);
        const sentences = findSentences(fileContent, word);

        // Generate CSV content
        const csvContent = `${word},${wordCount}\n\nSentences containing the word:\n${sentences.join('\n')}`;

        // Store the CSV file in the database
        const csvFileName = await storeCSVInDatabase(fileName, csvContent, word, wordCount.toString(), new Date().toISOString());

        // Return the CSV file name for download
        res.status(200).send({ csvFileName, wordCount, sentences: formatSentences(sentences) });
    } catch (error) {
        logger.error(`Error searching for word: ${error}`);
        res.status(500).send({ error: 'Failed to search for word' });
    }
}

// Function to retrieve file content from S3
const getFileFromS3 = async (fileName: string): Promise<string> => {

    const bucketName: string | undefined = process.env.S3_BUCKET_NAME;

    if (!bucketName) {
        throw new Error('S3 bucket name is missing');
    }


    const params = {
        Bucket: bucketName,
        Key: fileName
    };

    return new Promise<string>((resolve, reject) => {
        s3.getObject(params, (err, data) => {
            if (!data || !data.Body) {
                reject(new Error('File not found'));
            }
            if (err) {
                reject(err);
            } else {
                resolve(data.Body?.toString() ?? '');
            }
        });
    });
};

// Function to count occurrences of a word in a string
// Function to count occurrences of a word in a string
const countOccurrences = (text: string, word: string): number => {
    const regex = new RegExp(`${word}`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
};

// Function to find sentences containing a word in a string
const findSentences = (text: string, word: string): string[] => {
    const sentences: string[] = [];
    let currentSentence = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        currentSentence += char;

        // Check if the current character is one of ., !, or ?
        if (char === '.' || char === '!' || char === '?') {
            // Check if the next character is a space followed by a lowercase letter
            if (text[i + 1] === ' ' && /[a-z]/.test(text[i + 2])) {
                continue; // Not the end of a sentence
            }
            // Check if the current sentence contains the word
            if (currentSentence.toLowerCase().includes(word.toLowerCase())) {
                sentences.push(currentSentence.trim());
            }
            currentSentence = '';
        }
    }

    // Add the last sentence if there's anything left and it contains the word
    if (currentSentence.trim() !== '' && currentSentence.toLowerCase().includes(word.toLowerCase())) {
        sentences.push(currentSentence.trim());
    }

    return sentences;
};

// Function to format sentences for human readability
const formatSentences = (sentences: string[]): string[] => {
    return sentences.map(sentence => `- ${sentence.replace(/\n/g, '').replace(/\s+/g, ' ').trim()}`);
};

// Function to store CSV content in the database and return the file name
const storeCSVInDatabase = async (fileName: string, csvContent: string, word: string, wordcount: string, date: string): Promise<string> => {
    const query = 'INSERT INTO csv_files (file_name, content, word, wordcount, date) VALUES ($1, $2, $3, $4, $5) RETURNING file_name';
    const values = [fileName, csvContent, word, wordcount, date];

    try {
        const result = await pool.query(query, values);
        return result.rows[0].file_name;
    } catch (error) {
        throw new Error(`Error storing CSV file in database: ${error}`);
    }
};
