import express from 'express';
import { logInUserHandler } from '../handlers/authHandlers/logInUser';
import { refreshAccessTokenHandler } from '../handlers/authHandlers/refreshAcessToken';

const authRouter = express.Router();

//Route to log in a user
authRouter.post('/login', logInUserHandler);
authRouter.post('/refresh', refreshAccessTokenHandler);


export default authRouter;