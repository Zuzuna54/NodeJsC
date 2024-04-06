"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createUserHandler_1 = require("../handlers/userHandlers/createUserHandler");
const router = express_1.default.Router();
router.post('/', createUserHandler_1.createUserHandler);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map