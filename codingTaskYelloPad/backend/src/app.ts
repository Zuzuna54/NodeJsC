require('dotenv').config();
import 'reflect-metadata';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger from './utils/Logger';
import userRoutes from './routes/userRoutes'; // No need for relative path
import taskRoutes from './routes/taskRoutes'; // No need for relative path
import authRouter from './routes/authRoutes';

// Create a main function to use async/await
const main = async () => {

    try {

        // Create the express application
        const app: Express = express();
        // Use the cors middleware
        app.use(cors());
        // Use the body parser middleware to parse the body of incoming requests
        app.use(bodyParser.json());
        // Use the userRoutes router for all user routes
        app.use('/awesome/applicant', userRoutes); // Use the imported router
        // Use the taskRoutes router for all task routes
        app.use('/awesome/tasks', taskRoutes); // Use the imported router
        // Use the authRoutes router for all auth routes
        app.use('/awesome/auth', authRouter); // Use the imported router

        // Get the port from the environment variables, and store in the Express app
        const port: string | undefined = process.env.PORT || "8002";
        // Set the port
        app.set('port', port);
        // Get the mongo uri from the environment variables, and store in the Express app
        const PostgreSQL: string | undefined = process.env.DB_URI;

        // Check that the PostgreSQL environment variable is set


        // Connect to the PostgreSQL database



    } catch (error) {

        logger.error(`Error connecting to MongoDB:, ${error}`);
        throw error;

    }

}


// Call main function
main().catch((err) => {
    logger.error(err);
});

