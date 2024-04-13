'use strict';
import awsServerlessExpress from 'aws-serverless-express';
import app from '../app';
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
const server = awsServerlessExpress.createServer(app);


// export const handler = (event, context) => {
//     console.log(`EVENT: ${JSON.stringify(event)}`);
//     awsServerlessExpress.proxy(server, event, context);
// };

// export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> => {
//     console.log(`EVENT: ${JSON.stringify(event)}`);
//     try {

//         const result = await awsServerlessExpress.proxy(server, event, context, 'PROMISE');
//         return result;

//     } catch (error) {

//         console.error('Error occurred while proxying the request: ', error);
//         return {
//             statusCode: 500,
//             body: 'Internal Server Error',
//             headers: {}
//         };

//     }
// };

export const hello: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello World!',
            input: event,
        }),
    };
}