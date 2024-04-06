"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileModel = void 0;
const customError_1 = require("../utils/customError");
class FileModel {
    constructor(pool) {
        this.pool = pool;
    }
    async insertFile(fileName, csvFileName) {
        const query = 'INSERT INTO files (fileName, csvFileName) VALUES ($1, $2)';
        try {
            await this.pool.query(query, [fileName, csvFileName]);
        }
        catch (error) {
            console.error('Error inserting file into database:', error);
            throw new customError_1.CustomError('Failed to insert file into database.', 500);
        }
    }
    async getFiles() {
        const query = 'SELECT * FROM files';
        try {
            const result = await this.pool.query(query);
            return result.rows;
        }
        catch (error) {
            console.error('Error fetching files from database:', error);
            throw new customError_1.CustomError('Failed to fetch files from database.', 500);
        }
    }
}
exports.FileModel = FileModel;
//# sourceMappingURL=filemodel.js.map