"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadHandler_1 = require("../handlers/uploadHandlers/uploadHandler");
const multerMiddleware_1 = require("../middlewares/multerMiddleware");
const uploadRouter = express_1.default.Router();
uploadRouter.post('/', multerMiddleware_1.upload.single('file'), uploadHandler_1.uploadHandler);
exports.default = uploadRouter;
//# sourceMappingURL=uploadRoutes.js.map