import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Listing } from "../models/Listing";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { AuditLog } from "../models/AuditLog";
import { AuthedRequest } from "../middleware/auth.middleware";
import { rejectSchema, verifyUserSchema } from "../validation/admin.validation";
import { getSignedUrl } from "../utils/signedUrl";

function toId(value: string) {
  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
}

function publicUser(user: {
  _id: unknown;
  name?: string | null;
  email?: string | null;
  phone: string;
  role: string;
  verified: boolean;
  companyName?: string | null;
  reraId?: string | null;
}) {
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

export async function getAdminListings(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (typeof status === "string" && status.trim()) filter.status = status;

    const listings = await Listing.find(filter)
      .select("+ownershipDocPath")
      .populate("ownerId", "name phone")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      listings: listings.map((listing) => {
        const owner =
          listing.ownerId && typeof listing.ownerId === "object" && "phone" in listing.ownerId
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
          ownershipDocUrl: listing.ownershipDocPath ? getSignedUrl(listing.ownershipDocPath) : null,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
}

export async function approveListing(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Listing not found" });

    const listing = await Listing.findOneAndUpdate(
      { _id: id, status: "PENDING" },
      { status: "LIVE" },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: "Listing not found or not awaiting review" });

    await AuditLog.create({
      adminId: req.user!.userId,
      action: "LISTING_APPROVED",
      targetType: "LISTING",
      targetId: listing._id,
    });

    res.json({ listing: { id: listing._id.toString(), status: listing.status } });
  } catch (err) {
    next(err);
  }
}

export async function rejectListing(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Listing not found" });

    const listing = await Listing.findOneAndUpdate(
      { _id: id, status: "PENDING" },
      { status: "REJECTED" },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: "Listing not found or not awaiting review" });

    await AuditLog.create({
      adminId: req.user!.userId,
      action: "LISTING_REJECTED",
      targetType: "LISTING",
      targetId: listing._id,
      reason: parsed.data.reason,
    });

    res.json({ listing: { id: listing._id.toString(), status: listing.status } });
  } catch (err) {
    next(err);
  }
}

export async function getAdminUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { role, verified } = req.query;
    const filter: Record<string, unknown> = {};
    if (typeof role === "string" && role.trim()) filter.role = role;
    if (verified !== undefined) filter.verified = verified === "true";

    const users = await User.find(filter)
      .select("name email phone role verified companyName reraId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users: users.map(publicUser) });
  } catch (err) {
    next(err);
  }
}

export async function verifyUser(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = verifyUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "User not found" });

    const user = await User.findByIdAndUpdate(id, { verified: parsed.data.verified }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    await AuditLog.create({
      adminId: req.user!.userId,
      action: parsed.data.verified ? "USER_VERIFIED" : "USER_UNVERIFIED",
      targetType: "USER",
      targetId: user._id,
    });

    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (typeof status === "string" && status.trim()) filter.status = status;

    const projects = await Project.find(filter)
      .populate("builderId", "name companyName phone")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      projects: projects.map((project) => {
        const builder =
          project.builderId && typeof project.builderId === "object" && "phone" in project.builderId
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
  } catch (err) {
    next(err);
  }
}

export async function approveProject(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Project not found" });

    const project = await Project.findOneAndUpdate(
      { _id: id, status: "PENDING" },
      { status: "LIVE" },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: "Project not found or not awaiting review" });

    await AuditLog.create({
      adminId: req.user!.userId,
      action: "PROJECT_APPROVED",
      targetType: "PROJECT",
      targetId: project._id,
    });

    res.json({ project: { id: project._id.toString(), status: project.status } });
  } catch (err) {
    next(err);
  }
}

export async function rejectProject(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Project not found" });

    const project = await Project.findOneAndUpdate(
      { _id: id, status: "PENDING" },
      { status: "REJECTED" },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: "Project not found or not awaiting review" });

    await AuditLog.create({
      adminId: req.user!.userId,
      action: "PROJECT_REJECTED",
      targetType: "PROJECT",
      targetId: project._id,
      reason: parsed.data.reason,
    });

    res.json({ project: { id: project._id.toString(), status: project.status } });
  } catch (err) {
    next(err);
  }
}
