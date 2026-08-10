"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireVerifiedBuilder = requireVerifiedBuilder;
const User_1 = require("../models/User");
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "You don't have permission to do that" });
        }
        next();
    };
}
async function requireVerifiedBuilder(req, res, next) {
    if (!req.user)
        return res.status(401).json({ error: "Not logged in" });
    const user = await User_1.User.findById(req.user.userId).select("role verified");
    if (!user || user.role !== "BUILDER" || !user.verified) {
        return res
            .status(403)
            .json({ error: "Your builder account needs admin verification before you can create projects" });
    }
    next();
}
