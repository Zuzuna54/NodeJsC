// src/middlewares/multerMiddleware.ts
import multer from 'multer';

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

export { upload };
