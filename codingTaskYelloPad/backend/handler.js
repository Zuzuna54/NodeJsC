'use strict';
const app = require('./dist/app.js');
const serverlessHttp = require('serverless-http');

module.exports.hello = serverlessHttp(app);