"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logInUser_1 = require("../handlers/authHandlers/logInUser");
const refreshAcessToken_1 = require("../handlers/authHandlers/refreshAcessToken");
const authRouter = express_1.default.Router();
authRouter.post('/login', logInUser_1.logInUserHandler);
authRouter.post('/refresh', refreshAcessToken_1.refreshAccessTokenHandler);
exports.default = authRouter;
//# sourceMappingURL=authRoutes.js.map