import express from 'express';
import { createUserHandler } from '../handlers/userHandlers/createUserHandler';
// import updateUserHandler from '../handlers/updateUserHandler';
// import deleteUserHandler from '../handlers/deleteUserHandler';


const router = express.Router();

router.post('/', createUserHandler);
// router.put('/:id', updateUserHandler);
// router.delete('/:id', deleteUserHandler);

export default router;