// Upload Routes
// Description: Routes for uploading files
import express from 'express';
import { uploadHandler } from '../handlers/uploadHandlers/uploadHandler';
// import { historyHandler } from '../handlers/uploadHandlers/historyHandler';
import { upload } from '../middlewares/multerMiddleware';


const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('file'), uploadHandler);
// uploadRouter.get('/history', historyHandler.getUploadHistory);

export default uploadRouter;
