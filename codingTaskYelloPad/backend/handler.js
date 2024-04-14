'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app = require('./dist/app.js');
//import app as module from './dist/app.js';
const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(app);


module.exports.latestApp = (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    awsServerlessExpress.proxy(server, event, context);
};

