"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
function requireAuth(req, res, next) {
    const token = req.cookies?.thikana_session;
    if (!token) {
        return res.status(401).json({ error: "Not logged in" });
    }
    try {
        req.user = (0, jwt_1.verifyToken)(token);
        next();
    }
    catch {
        return res.status(401).json({ error: "Session expired, please log in again" });
    }
}
