//db connection file

require('dotenv').config();
import { Pool } from 'pg';


const USER: string | undefined = process.env.DB_USER;
const HOST: string | undefined = process.env.DB_HOST;
const NAME: string | undefined = process.env.DB_NAME;
const PASSWORD: string | undefined = process.env.DB_PASSWORD;
const PORT: string | undefined = process.env.DB_PORT;


export const pool = new Pool({
    user: USER,
    host: HOST,
    database: NAME,
    password: PASSWORD,
    port: Number(PORT),
});