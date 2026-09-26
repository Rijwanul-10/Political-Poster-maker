"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRouter_1 = __importDefault(require("./authRouter"));
// Placeholder imports – will be replaced with real routers later
const templateRouter_1 = __importDefault(require("./templateRouter"));
const posterRouter_1 = __importDefault(require("./posterRouter"));
const uploadRouter_1 = __importDefault(require("./uploadRouter"));
const router = express_1.default.Router();
router.use('/auth', authRouter_1.default);
router.use('/templates', templateRouter_1.default);
router.use('/posters', posterRouter_1.default);
router.use('/upload', uploadRouter_1.default);
exports.default = router;
