"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHandler = void 0;
const Logger_1 = __importDefault(require("../../utils/Logger"));
const db_1 = require("../../services/db");
const uploadService_1 = __importDefault(require("../../services/uploadService"));
const uploadHandler = async (req, res) => {
    Logger_1.default.info(`Initiating the uploadHandler\n`);
    try {
        const fileUploadService = new uploadService_1.default(db_1.pool);
        Logger_1.default.info(`Request to upload a file\n`);
        if (!req.file) {
            res.status(400).send({ message: 'No file uploaded' });
            return;
        }
        const { originalname, buffer } = req.file;
        Logger_1.default.info(`Checking if the file already exists\n`);
        const fileExistsResult = await fileUploadService.getFileByName(originalname);
        if (fileExistsResult.data) {
            res.status(400).send({ message: 'File already exists' });
            return;
        }
        Logger_1.default.info(`Uploading the file\n`);
        const uploadResult = await fileUploadService.uploadFileToS3(originalname, buffer);
        res.status(uploadResult.statusCode).send({ message: uploadResult.message, fileName: originalname });
    }
    catch (error) {
        Logger_1.default.error(`Error uploading file: ${error}`);
        res.status(500).send({ error: 'Failed to upload file' });
    }
};
exports.uploadHandler = uploadHandler;
//# sourceMappingURL=uploadHandler.js.map