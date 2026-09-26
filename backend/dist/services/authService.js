"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Hash a plain‑text password.
 * Uses 10 salt rounds – sufficient for dev/MVP.
 */
async function hashPassword(password) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
}
/**
 * Compare a plain‑text password with a stored hash.
 */
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
