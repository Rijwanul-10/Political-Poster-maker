"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Poster_1 = require("../models/Poster");
const Template_1 = require("../models/Template");
const geminiService_1 = require("../services/geminiService");
const renderService_1 = require("../services/renderService");
const storageService_1 = require("../services/storageService");
const router = express_1.default.Router();
// Helper to ensure user is attached
router.use(auth_1.authMiddleware);
// POST /api/posters – create a poster generation request
router.post('/', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { templateId, formData, photoUrls, } = req.body;
        // Validate template exists
        const template = await Template_1.Template.findById(templateId);
        if (!template)
            return res.status(404).json({ error: 'Template not found' });
        // Create Poster doc in "draft" state
        const poster = new Poster_1.Poster({
            userId,
            templateId,
            formData,
            uploadedPhotoUrls: photoUrls,
            status: 'generating',
        });
        await poster.save();
        // Call Gemini for layout suggestions (crops, colors)
        const geminiSuggestion = await (0, geminiService_1.generateLayoutSuggestion)(template, photoUrls, formData);
        poster.geminiSuggestion = geminiSuggestion;
        await poster.save();
        // Render poster image via Puppeteer
        const imageBuffer = await (0, renderService_1.renderPosterToBuffer)(template, geminiSuggestion, formData, photoUrls);
        // Upload final image to Cloudinary
        const uploadResult = await (0, storageService_1.uploadFromBuffer)(imageBuffer, 'generated-posters');
        poster.generatedImageUrl = uploadResult.url;
        poster.status = 'completed';
        await poster.save();
        res.status(201).json({ posterId: poster._id, imageUrl: poster.generatedImageUrl });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/posters/:id – fetch poster status/result
router.get('/:id', async (req, res, next) => {
    try {
        const poster = await Poster_1.Poster.findById(req.params.id);
        if (!poster)
            return res.status(404).json({ error: 'Poster not found' });
        res.json(poster);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/posters/:id/regenerate – allow limited retries
router.post('/:id/regenerate', async (req, res, next) => {
    try {
        const poster = await Poster_1.Poster.findById(req.params.id);
        if (!poster)
            return res.status(404).json({ error: 'Poster not found' });
        if (poster.regenerateCount >= 3) {
            return res.status(429).json({ error: 'Regeneration limit reached' });
        }
        // Re‑run Gemini and render steps
        const template = await Template_1.Template.findById(poster.templateId);
        if (!template)
            return res.status(500).json({ error: 'Template missing' });
        const geminiSuggestion = await (0, geminiService_1.generateLayoutSuggestion)(template, poster.uploadedPhotoUrls, poster.formData);
        poster.geminiSuggestion = geminiSuggestion;
        poster.regenerateCount += 1;
        await poster.save();
        const imageBuffer = await (0, renderService_1.renderPosterToBuffer)(template, geminiSuggestion, poster.formData, poster.uploadedPhotoUrls);
        const uploadResult = await (0, storageService_1.uploadFromBuffer)(imageBuffer, 'generated-posters');
        poster.generatedImageUrl = uploadResult.url;
        poster.status = 'completed';
        await poster.save();
        res.json({ posterId: poster._id, imageUrl: poster.generatedImageUrl });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
