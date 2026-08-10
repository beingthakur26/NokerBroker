import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Inquiry } from "../models/Inquiry";
import { Project } from "../models/Project";
import { AuthedRequest } from "../middleware/auth.middleware";
import { createInquirySchema } from "../validation/project.validation";

export async function createInquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createInquirySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const data = parsed.data;
    if (!data.projectId && !data.listingId) {
      return res.status(400).json({ error: "Provide a project or listing to inquire about" });
    }

    let userId: Types.ObjectId | undefined;
    const authed = req as AuthedRequest;
    if (authed.user?.userId) {
      userId = new Types.ObjectId(authed.user.userId);
    }

    const inquiry = await Inquiry.create({
      projectId: data.projectId ? new Types.ObjectId(data.projectId) : undefined,
      listingId: data.listingId ? new Types.ObjectId(data.listingId) : undefined,
      userId,
      name: data.name,
      phone: data.phone,
      message: data.message,
      unitType: data.unitType,
    });

    res.status(201).json({ inquiry: { id: inquiry._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function getMyInquiries(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const projects = await Project.find({ builderId: req.user!.userId }).select("_id name").lean();
    const projectIds = projects.map((p) => p._id);

    const inquiries = await Inquiry.find({ projectId: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .populate("projectId", "name")
      .lean();

    res.json({
      inquiries: inquiries.map((inquiry) => ({
        id: inquiry._id.toString(),
        projectName:
          inquiry.projectId && typeof inquiry.projectId === "object" && "name" in inquiry.projectId
            ? inquiry.projectId.name
            : "",
        name: inquiry.name,
        phone: inquiry.phone,
        message: inquiry.message ?? "",
        unitType: inquiry.unitType ?? "",
        createdAt: inquiry.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyBuyerInquiries(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const inquiries = await Inquiry.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .populate("projectId", "name")
      .lean();

    res.json({
      inquiries: inquiries.map((inquiry) => ({
        id: inquiry._id.toString(),
        projectName:
          inquiry.projectId && typeof inquiry.projectId === "object" && "name" in inquiry.projectId
            ? inquiry.projectId.name
            : "",
        name: inquiry.name,
        phone: inquiry.phone,
        message: inquiry.message ?? "",
        unitType: inquiry.unitType ?? "",
        createdAt: inquiry.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}
