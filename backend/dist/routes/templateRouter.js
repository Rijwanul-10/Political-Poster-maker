"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Template_1 = require("../models/Template");
const router = express_1.default.Router();
// GET /api/templates - list all active templates (optional ?occasion=...)
router.get('/', async (req, res, next) => {
    try {
        const { occasion } = req.query;
        const filter = { isActive: true };
        if (occasion)
            filter.occasionType = occasion;
        const templates = await Template_1.Template.find(filter).select('-layoutConfig'); // don't send heavy layout config
        res.json(templates);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/templates/:id - get a single template (including layoutConfig)
router.get('/:id', async (req, res, next) => {
    try {
        const tmpl = await Template_1.Template.findById(req.params.id);
        if (!tmpl)
            return res.status(404).json({ error: 'Template not found' });
        res.json(tmpl);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
