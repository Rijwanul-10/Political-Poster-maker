"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const storageService_1 = require("../services/storageService");
const upload = (0, multer_1.default)(); // memory storage
const router = express_1.default.Router();
// POST /api/upload – expects multipart/form-data with field "file"
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const { buffer, originalname } = req.file;
        const folder = 'political-poster-uploads';
        const result = await (0, storageService_1.uploadFromBuffer)(buffer, folder);
        res.json({ url: result.url, public_id: result.public_id, filename: originalname });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
