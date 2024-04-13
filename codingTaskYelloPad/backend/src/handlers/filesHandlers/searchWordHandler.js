"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchWordHandler = void 0;
const Logger_1 = __importDefault(require("../../utils/Logger"));
const aws_sdk_1 = require("aws-sdk");
const db_1 = require("../../services/db");
const s3 = new aws_sdk_1.S3();
const searchWordHandler = async (req, res) => {
    Logger_1.default.info(`Initiating the searchWordHandler\n`);
    try {
        const { word, file_name } = req.body;
        if (!word) {
            res.status(400).send({ message: 'Word to search for is missing' });
            return;
        }
        const fileName = file_name;
        const fileContent = await getFileFromS3(fileName);
        const wordCount = countOccurrences(fileContent, word);
        const sentences = findSentences(fileContent, word);
        const csvContent = `${word},${wordCount}\n\nSentences containing the word:\n${sentences.join('\n')}`;
        const csvFileName = await storeCSVInDatabase(fileName, csvContent, word, wordCount.toString(), new Date().toISOString());
        res.status(200).send({ csvFileName, wordCount, sentences: formatSentences(sentences) });
    }
    catch (error) {
        Logger_1.default.error(`Error searching for word: ${error}`);
        res.status(500).send({ error: 'Failed to search for word' });
    }
};
exports.searchWordHandler = searchWordHandler;
const getFileFromS3 = async (fileName) => {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
        throw new Error('S3 bucket name is missing');
    }
    const params = {
        Bucket: bucketName,
        Key: fileName
    };
    return new Promise((resolve, reject) => {
        s3.getObject(params, (err, data) => {
            var _a, _b;
            if (!data || !data.Body) {
                reject(new Error('File not found'));
            }
            if (err) {
                reject(err);
            }
            else {
                resolve((_b = (_a = data.Body) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '');
            }
        });
    });
};
const countOccurrences = (text, word) => {
    const regex = new RegExp(`${word}`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
};
const findSentences = (text, word) => {
    const sentences = [];
    let currentSentence = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        currentSentence += char;
        if (char === '.' || char === '!' || char === '?') {
            if (text[i + 1] === ' ' && /[a-z]/.test(text[i + 2])) {
                continue;
            }
            if (currentSentence.toLowerCase().includes(word.toLowerCase())) {
                sentences.push(currentSentence.trim());
            }
            currentSentence = '';
        }
    }
    if (currentSentence.trim() !== '' && currentSentence.toLowerCase().includes(word.toLowerCase())) {
        sentences.push(currentSentence.trim());
    }
    return sentences;
};
const formatSentences = (sentences) => {
    return sentences.map(sentence => `- ${sentence.replace(/\n/g, '').replace(/\s+/g, ' ').trim()}`);
};
const storeCSVInDatabase = async (fileName, csvContent, word, wordcount, date) => {
    const query = 'INSERT INTO csv_files (file_name, content, word, wordcount, date) VALUES ($1, $2, $3, $4, $5) RETURNING file_name';
    const values = [fileName, csvContent, word, wordcount, date];
    try {
        const result = await db_1.pool.query(query, values);
        return result.rows[0].file_name;
    }
    catch (error) {
        throw new Error(`Error storing CSV file in database: ${error}`);
    }
};
//# sourceMappingURL=searchWordHandler.js.map