"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwtService_1 = require("../services/jwtService");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    const payload = (0, jwtService_1.verifyToken)(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    // Attach minimal user info to request (id & role). Full user can be fetched later if needed.
    req.user = { _id: payload.sub, role: payload.role };
    next();
}
