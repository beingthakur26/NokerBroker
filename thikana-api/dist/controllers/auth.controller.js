"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtp = requestOtp;
exports.verifySignupOtp = verifySignupOtp;
exports.verifyLoginOtp = verifyLoginOtp;
exports.me = me;
exports.updateProfile = updateProfile;
exports.logout = logout;
const Otp_1 = require("../models/Otp");
const User_1 = require("../models/User");
const otp_1 = require("../utils/otp");
const jwt_1 = require("../utils/jwt");
const auth_validation_1 = require("../validation/auth.validation");
async function requestOtp(req, res) {
    const parsed = auth_validation_1.requestOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { phone } = parsed.data;
    const code = (0, otp_1.generateOtp)();
    const codeHash = await (0, otp_1.hashOtp)(code);
    await Otp_1.Otp.findOneAndDelete({ phone }); // clear any earlier unused OTP for this number
    await Otp_1.Otp.create({
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    // DEV ONLY — replace this with an MSG91/Twilio SMS call before going to production.
    // In production, send the OTP through an SMS provider instead of logging it.
    if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV] OTP for ${phone}: ${code}`);
    }
    res.json({ message: "OTP sent" });
}
async function consumeOtp(phone, code, res) {
    const otpRecord = await Otp_1.Otp.findOne({ phone });
    if (!otpRecord) {
        res.status(400).json({ error: "OTP expired or not requested. Request a new one." });
        return false;
    }
    if (otpRecord.expiresAt <= new Date()) {
        await Otp_1.Otp.deleteOne({ _id: otpRecord._id });
        res.status(400).json({ error: "OTP expired. Request a new one." });
        return false;
    }
    const isValid = await (0, otp_1.compareOtp)(code, otpRecord.codeHash);
    if (!isValid) {
        res.status(400).json({ error: "Incorrect code." });
        return false;
    }
    await Otp_1.Otp.deleteOne({ _id: otpRecord._id });
    return true;
}
function setSession(res, user) {
    const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
    res.cookie("thikana_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
function publicUser(user) {
    return {
        id: String(user._id),
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        companyName: user.companyName ?? "",
        reraId: user.reraId ?? "",
    };
}
async function verifySignupOtp(req, res) {
    const parsed = auth_validation_1.signupOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { phone, code, role, companyName, reraId } = parsed.data;
    if (!(await consumeOtp(phone, code, res)))
        return;
    const existingUser = await User_1.User.findOne({ phone });
    if (existingUser) {
        return res.status(409).json({ error: "An account already exists for this number. Please log in." });
    }
    const user = await User_1.User.create({
        phone,
        role,
        verified: false,
        companyName: role === "BUILDER" ? companyName : undefined,
        reraId: role === "BUILDER" ? reraId : undefined,
    });
    setSession(res, user);
    res.status(201).json({ user: publicUser(user) });
}
async function verifyLoginOtp(req, res) {
    const parsed = auth_validation_1.loginOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { phone, code } = parsed.data;
    if (!(await consumeOtp(phone, code, res)))
        return;
    const user = await User_1.User.findOne({ phone });
    if (!user) {
        return res.status(404).json({ error: "No account found for this number. Please sign up." });
    }
    setSession(res, user);
    res.json({ user: publicUser(user) });
}
async function me(req, res) {
    const user = await User_1.User.findById(req.user.userId);
    if (!user)
        return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
}
async function updateProfile(req, res) {
    const parsed = auth_validation_1.updateProfileSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues[0].message });
    if (parsed.data.email) {
        const emailOwner = await User_1.User.findOne({ email: parsed.data.email, _id: { $ne: req.user.userId } });
        if (emailOwner)
            return res.status(409).json({ error: "This email address is already in use" });
    }
    const user = await User_1.User.findByIdAndUpdate(req.user.userId, parsed.data, { new: true, runValidators: true });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
}
function logout(_req, res) {
    res.clearCookie("thikana_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.status(204).end();
}
