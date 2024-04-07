"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
require('dotenv').config();
const pg_1 = require("pg");
const USER = process.env.DB_USER;
const HOST = process.env.DB_HOST;
const NAME = process.env.DB_NAME;
const PASSWORD = process.env.DB_PASSWORD;
const PORT = process.env.DB_PORT;
exports.pool = new pg_1.Pool({
    user: USER,
    host: HOST,
    database: NAME,
    password: PASSWORD,
    port: Number(PORT),
});
//# sourceMappingURL=db.js.map