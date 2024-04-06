// utils/Logger.ts
import winston from 'winston';

class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.simple(),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' }),
            ],
        });
    }

    info(message: string): void {
        this.logger.info(message);
    }

    warn(message: string): void {
        this.logger.warn(message);
    }

    error(message: string): void {
        this.logger.error(message);
    }
}

export default new Logger();
