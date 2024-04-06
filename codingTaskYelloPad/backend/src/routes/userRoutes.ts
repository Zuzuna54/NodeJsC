// User Routes
import express from 'express';
import { createUserHandler } from '../handlers/userHandlers/createUserHandler';

const router = express.Router();

router.post('/', createUserHandler);

export default router;