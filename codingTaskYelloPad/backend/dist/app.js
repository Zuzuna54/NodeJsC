"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const Logger_1 = __importDefault(require("./utils/Logger"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const logger = new Logger_1.default();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.get('/health', (req, res) => {
    logger.info('Health Started');
    logger.info(`${req.method} request to ${req.url} from ${req.ip}`);
    res.status(200).send('Healthy');
    logger.info('Health check done');
});
app.use('/awesome/applicant', userRoutes_1.default);
app.use('/awesome/uploads', uploadRoutes_1.default);
app.use('/awesome/auth', authRoutes_1.default);
const port = process.env.PORT || "8002";
app.set('port', port);
app.listen(app.get('port'), () => {
    logger.info(`Server is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
    logger.info('Press CTRL-C to stop\n');
});
exports.default = app;
//# sourceMappingURL=app.js.map