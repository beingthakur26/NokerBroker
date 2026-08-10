"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInquiry = createInquiry;
exports.getMyInquiries = getMyInquiries;
exports.getMyBuyerInquiries = getMyBuyerInquiries;
const mongoose_1 = require("mongoose");
const Inquiry_1 = require("../models/Inquiry");
const Project_1 = require("../models/Project");
const project_validation_1 = require("../validation/project.validation");
async function createInquiry(req, res, next) {
    try {
        const parsed = project_validation_1.createInquirySchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.issues[0].message });
        const data = parsed.data;
        if (!data.projectId && !data.listingId) {
            return res.status(400).json({ error: "Provide a project or listing to inquire about" });
        }
        let userId;
        const authed = req;
        if (authed.user?.userId) {
            userId = new mongoose_1.Types.ObjectId(authed.user.userId);
        }
        const inquiry = await Inquiry_1.Inquiry.create({
            projectId: data.projectId ? new mongoose_1.Types.ObjectId(data.projectId) : undefined,
            listingId: data.listingId ? new mongoose_1.Types.ObjectId(data.listingId) : undefined,
            userId,
            name: data.name,
            phone: data.phone,
            message: data.message,
            unitType: data.unitType,
        });
        res.status(201).json({ inquiry: { id: inquiry._id.toString() } });
    }
    catch (err) {
        next(err);
    }
}
async function getMyInquiries(req, res, next) {
    try {
        const projects = await Project_1.Project.find({ builderId: req.user.userId }).select("_id name").lean();
        const projectIds = projects.map((p) => p._id);
        const inquiries = await Inquiry_1.Inquiry.find({ projectId: { $in: projectIds } })
            .sort({ createdAt: -1 })
            .populate("projectId", "name")
            .lean();
        res.json({
            inquiries: inquiries.map((inquiry) => ({
                id: inquiry._id.toString(),
                projectName: inquiry.projectId && typeof inquiry.projectId === "object" && "name" in inquiry.projectId
                    ? inquiry.projectId.name
                    : "",
                name: inquiry.name,
                phone: inquiry.phone,
                message: inquiry.message ?? "",
                unitType: inquiry.unitType ?? "",
                createdAt: inquiry.createdAt,
            })),
        });
    }
    catch (err) {
        next(err);
    }
}
async function getMyBuyerInquiries(req, res, next) {
    try {
        const inquiries = await Inquiry_1.Inquiry.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .populate("projectId", "name")
            .lean();
        res.json({
            inquiries: inquiries.map((inquiry) => ({
                id: inquiry._id.toString(),
                projectName: inquiry.projectId && typeof inquiry.projectId === "object" && "name" in inquiry.projectId
                    ? inquiry.projectId.name
                    : "",
                name: inquiry.name,
                phone: inquiry.phone,
                message: inquiry.message ?? "",
                unitType: inquiry.unitType ?? "",
                createdAt: inquiry.createdAt,
            })),
        });
    }
    catch (err) {
        next(err);
    }
}
