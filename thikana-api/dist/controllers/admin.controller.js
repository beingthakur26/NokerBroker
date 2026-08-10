"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminListings = getAdminListings;
exports.approveListing = approveListing;
exports.rejectListing = rejectListing;
exports.getAdminUsers = getAdminUsers;
exports.verifyUser = verifyUser;
exports.getAdminProjects = getAdminProjects;
exports.approveProject = approveProject;
exports.rejectProject = rejectProject;
const mongoose_1 = require("mongoose");
const Listing_1 = require("../models/Listing");
const Project_1 = require("../models/Project");
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const admin_validation_1 = require("../validation/admin.validation");
const signedUrl_1 = require("../utils/signedUrl");
function toId(value) {
    return mongoose_1.Types.ObjectId.isValid(value) ? new mongoose_1.Types.ObjectId(value) : null;
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
async function getAdminListings(req, res, next) {
    try {
        const { status } = req.query;
        const filter = {};
        if (typeof status === "string" && status.trim())
            filter.status = status;
        const listings = await Listing_1.Listing.find(filter)
            .select("+ownershipDocPath")
            .populate("ownerId", "name phone")
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            listings: listings.map((listing) => {
                const owner = listing.ownerId && typeof listing.ownerId === "object" && "phone" in listing.ownerId
                    ? {
                        name: "name" in listing.ownerId ? listing.ownerId.name ?? "" : "",
                        phone: listing.ownerId.phone,
                    }
                    : null;
                return {
                    id: listing._id.toString(),
                    type: listing.type,
                    locality: listing.locality,
                    pinCode: listing.pinCode,
                    price: listing.price,
                    areaSqft: listing.areaSqft,
                    bhk: listing.bhk,
                    images: listing.images,
                    status: listing.status,
                    createdAt: listing.createdAt,
                    owner,
                    ownershipDocUrl: listing.ownershipDocPath ? (0, signedUrl_1.getSignedUrl)(listing.ownershipDocPath) : null,
                };
            }),
        });
    }
    catch (err) {
        next(err);
    }
}
async function approveListing(req, res, next) {
    try {
        const rawId = req.params.id;
        const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!id)
            return res.status(404).json({ error: "Listing not found" });
        const listing = await Listing_1.Listing.findOneAndUpdate({ _id: id, status: "PENDING" }, { status: "LIVE" }, { new: true });
        if (!listing)
            return res.status(404).json({ error: "Listing not found or not awaiting review" });
        await AuditLog_1.AuditLog.create({
            adminId: req.user.userId,
            action: "LISTING_APPROVED",
            targetType: "LISTING",
            targetId: listing._id,
        });
        res.json({ listing: { id: listing._id.toString(), status: listing.status } });
    }
    catch (err) {
        next(err);
    }
}
async function rejectListing(req, res, next) {
    try {
        const parsed = admin_validation_1.rejectSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.issues[0].message });
        const rawId = req.params.id;
        const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!id)
            return res.status(404).json({ error: "Listing not found" });
        const listing = await Listing_1.Listing.findOneAndUpdate({ _id: id, status: "PENDING" }, { status: "REJECTED" }, { new: true });
        if (!listing)
            return res.status(404).json({ error: "Listing not found or not awaiting review" });
        await AuditLog_1.AuditLog.create({
            adminId: req.user.userId,
            action: "LISTING_REJECTED",
            targetType: "LISTING",
            targetId: listing._id,
            reason: parsed.data.reason,
        });
        res.json({ listing: { id: listing._id.toString(), status: listing.status } });
    }
    catch (err) {
        next(err);
    }
}
async function getAdminUsers(req, res, next) {
    try {
        const { role, verified } = req.query;
        const filter = {};
        if (typeof role === "string" && role.trim())
            filter.role = role;
        if (verified !== undefined)
            filter.verified = verified === "true";
        const users = await User_1.User.find(filter)
            .select("name email phone role verified companyName reraId createdAt")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ users: users.map(publicUser) });
    }
    catch (err) {
        next(err);
    }
}
async function verifyUser(req, res, next) {
    try {
        const parsed = admin_validation_1.verifyUserSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.issues[0].message });
        const rawId = req.params.id;
        const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!id)
            return res.status(404).json({ error: "User not found" });
        const user = await User_1.User.findByIdAndUpdate(id, { verified: parsed.data.verified }, { new: true });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        await AuditLog_1.AuditLog.create({
            adminId: req.user.userId,
            action: parsed.data.verified ? "USER_VERIFIED" : "USER_UNVERIFIED",
            targetType: "USER",
            targetId: user._id,
        });
        res.json({ user: publicUser(user) });
    }
    catch (err) {
        next(err);
    }
}
async function getAdminProjects(req, res, next) {
    try {
        const { status } = req.query;
        const filter = {};
        if (typeof status === "string" && status.trim())
            filter.status = status;
        const projects = await Project_1.Project.find(filter)
            .populate("builderId", "name companyName phone")
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            projects: projects.map((project) => {
                const builder = project.builderId && typeof project.builderId === "object" && "phone" in project.builderId
                    ? {
                        name: "name" in project.builderId ? project.builderId.name ?? "" : "",
                        companyName: "companyName" in project.builderId ? project.builderId.companyName ?? "" : "",
                        phone: project.builderId.phone,
                    }
                    : null;
                return {
                    id: project._id.toString(),
                    name: project.name,
                    locality: project.locality,
                    pinCode: project.pinCode,
                    reraId: project.reraId,
                    images: project.images,
                    status: project.status,
                    createdAt: project.createdAt,
                    builder,
                };
            }),
        });
    }
    catch (err) {
        next(err);
    }
}
async function approveProject(req, res, next) {
    try {
        const rawId = req.params.id;
        const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!id)
            return res.status(404).json({ error: "Project not found" });
        const project = await Project_1.Project.findOneAndUpdate({ _id: id, status: "PENDING" }, { status: "LIVE" }, { new: true });
        if (!project)
            return res.status(404).json({ error: "Project not found or not awaiting review" });
        await AuditLog_1.AuditLog.create({
            adminId: req.user.userId,
            action: "PROJECT_APPROVED",
            targetType: "PROJECT",
            targetId: project._id,
        });
        res.json({ project: { id: project._id.toString(), status: project.status } });
    }
    catch (err) {
        next(err);
    }
}
async function rejectProject(req, res, next) {
    try {
        const parsed = admin_validation_1.rejectSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.issues[0].message });
        const rawId = req.params.id;
        const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!id)
            return res.status(404).json({ error: "Project not found" });
        const project = await Project_1.Project.findOneAndUpdate({ _id: id, status: "PENDING" }, { status: "REJECTED" }, { new: true });
        if (!project)
            return res.status(404).json({ error: "Project not found or not awaiting review" });
        await AuditLog_1.AuditLog.create({
            adminId: req.user.userId,
            action: "PROJECT_REJECTED",
            targetType: "PROJECT",
            targetId: project._id,
            reason: parsed.data.reason,
        });
        res.json({ project: { id: project._id.toString(), status: project.status } });
    }
    catch (err) {
        next(err);
    }
}
