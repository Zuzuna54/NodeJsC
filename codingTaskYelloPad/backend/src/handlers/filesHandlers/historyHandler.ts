// Import necessary modules
import { Request, Response } from 'express';
import { pool } from '../../services/db';
import logger from '../../utils/Logger';

// Define the route handler
export const historyHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        // Query the database to retrieve the history of uploaded files and CSVs
        const query = 'SELECT file_name, content FROM csv_files';
        const result = await pool.query(query);
        console.log(result.rows);
        // Extract the data from the result
        const history = result.rows.map(row => ({
            fileName: row.file_name,
            content: row.content,
            word: row.word,
            wordCount: row.wordcount,
            createdAt: row.date

        }));

        // Return the history as a response
        res.status(200).json({ history });
    } catch (error) {
        // Handle errors
        logger.error(`Error retrieving history: ${error}`);
        res.status(500).json({ error: 'Failed to retrieve history' });
    }
};