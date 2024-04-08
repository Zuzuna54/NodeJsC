// USer Service postgreSQL queries
import { Pool, QueryResult } from 'pg';
import { User } from '../models/userModel';
import GenericReturn from '../utils/genericReturn';
import logger from '../utils/Logger';

class UserService {

    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async createUser(user: User): Promise<GenericReturn> {

        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');
        const query: string = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';

        try {

            const result: QueryResult = await this.pool.query(query, [user.username, user.email, user.password]);
            if (result.rowCount !== 1) {

                logger.error('Failed to create user.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to create user.';

                return returnResult;
            }

            logger.info('User created.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User created.';
            return returnResult;


        } catch (error) {

            logger.error(`Error creating user: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to create user.';
            return returnResult;

        }
    }

    async getUserByEmail(email: string): Promise<GenericReturn> {

        const query: string = 'SELECT * FROM users WHERE email = $1';
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, [email]);

            if (result.rows.length == 0) {

                logger.error('Failed to fetch user by email.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch user by email.';
                return returnResult;

            }

            logger.info('User fetched.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User fetched.';
            returnResult.data = result.rows[0];
            return returnResult;

        } catch (error) {

            logger.error(`Error fetching user by email:  ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch user by email.';
            return returnResult;

        }
    }

    async getUserById(id: number): Promise<GenericReturn> {

        const query: string = 'SELECT * FROM users WHERE id = $1';
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, [id]);

            if (result.rows.length == 0) {

                logger.error('Failed to fetch user by ID.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch user by ID.';
                return returnResult;

            }

            logger.info('User fetched.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User fetched.';
            returnResult.data = result.rows[0];
            return returnResult;

        } catch (error) {

            logger.error(`Error fetching user by ID: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch user by ID.';
            return returnResult;

        }
    }

    async getUserByUserName(username: string): Promise<GenericReturn> {

        console.log('username', username);
        const query: string = 'SELECT * FROM users WHERE username = $1';
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, [username]);

            if (result.rows.length == 0) {

                logger.error('Failed to fetch user by username.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch user by username.';
                return returnResult;

            }

            logger.info('User fetched.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User fetched.';
            returnResult.data = result.rows[0];
            return returnResult;

        } catch (error) {

            logger.error(`Error fetching user by username: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch user by username.';
            return returnResult;

        }
    }

    async updateUser(user: User): Promise<GenericReturn> {

        const query: string = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4';
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, [user.username, user.email, user.password, user.id]);

            if (result.rowCount !== 1) {

                logger.error('Failed to update user.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to update user.';
                return returnResult;

            }

            logger.info('User updated.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User updated.';
            return returnResult;

        } catch (error) {

            logger.error(`Error updating user: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to update user.';
            return returnResult;

        }
    }
}

export default UserService;
