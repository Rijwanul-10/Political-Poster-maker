"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const authService_1 = require("../services/authService");
const jwtService_1 = require("../services/jwtService");
const router = express_1.default.Router();
// Register a new user
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !password) {
            return res.status(400).json({ error: 'Name and password are required' });
        }
        const existing = await User_1.User.findOne({ $or: [{ email }, { phone }] });
        if (existing) {
            return res.status(409).json({ error: 'User with given email or phone already exists' });
        }
        const passwordHash = await (0, authService_1.hashPassword)(password);
        const user = new User_1.User({ name, email, phone, passwordHash });
        await user.save();
        const token = (0, jwtService_1.signToken)(user);
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    }
    catch (err) {
        next(err);
    }
});
// Login existing user
router.post('/login', async (req, res, next) => {
    try {
        const { email, phone, password } = req.body;
        if (!password || (!email && !phone)) {
            return res.status(400).json({ error: 'Password and either email or phone are required' });
        }
        const user = await User_1.User.findOne(email ? { email } : { phone });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const match = await (0, authService_1.comparePassword)(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = (0, jwtService_1.signToken)(user);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
