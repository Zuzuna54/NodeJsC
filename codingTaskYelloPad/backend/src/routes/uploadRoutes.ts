// Upload Routes
// Description: Routes for uploading files
import express from 'express';
import { uploadHandler } from '../handlers/filesHandlers/uploadHandler';
import { searchWordHandler } from '../handlers/filesHandlers/searchWordHandler';
import { historyHandler } from '../handlers/filesHandlers/historyHandler';
import { getFileNamesByUser } from '../handlers/filesHandlers/getFileNamesByUser';
import { upload } from '../middlewares/multerMiddleware';


const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('file'), uploadHandler);
uploadRouter.post('/search', searchWordHandler);
uploadRouter.get('/history', historyHandler);
uploadRouter.get('/fileNames', getFileNamesByUser);

export default uploadRouter;
