// src/models/FileModel.ts
import { Pool, QueryResult } from 'pg';
import { CustomError } from '../utils/customError';

export interface File {
    id: string;
    userId: string;
    fileName: string;
    csvFileName: string;
}

export class FileModel {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async insertFile(fileName: string, csvFileName: string): Promise<void> {
        const query = 'INSERT INTO files (fileName, csvFileName) VALUES ($1, $2)';
        try {
            await this.pool.query(query, [fileName, csvFileName]);
        } catch (error) {
            console.error('Error inserting file into database:', error);
            throw new CustomError('Failed to insert file into database.', 500);
        }
    }

    async getFiles(): Promise<File[]> {
        const query = 'SELECT * FROM files';
        try {
            const result: QueryResult = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error fetching files from database:', error);
            throw new CustomError('Failed to fetch files from database.', 500);
        }
    }
}
