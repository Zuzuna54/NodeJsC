'use strict';
const app = require('./dist/app.js');
const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(app);


export const app = (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    awsServerlessExpress.proxy(server, event, context);
};