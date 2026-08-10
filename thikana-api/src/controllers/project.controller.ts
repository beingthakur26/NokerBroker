import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Project } from "../models/Project";
import { Unit } from "../models/Unit";
import { AuthedRequest } from "../middleware/auth.middleware";
import {
  createProjectSchema,
  unitsArraySchema,
  updateProjectSchema,
} from "../validation/project.validation";
import { uploadBuffer } from "../utils/imagekitUpload";

function toId(value: string) {
  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
}

function parseJsonField(raw: unknown, label: string): unknown[] | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function publicProject(project: {
  _id: unknown;
  name: string;
  locality: string;
  pinCode: string;
  address?: string | null;
  description: string;
  reraId: string;
  images: string[];
  amenities: string[];
  possessionDate?: Date | null;
  constructionStatus: string;
  status: string;
  createdAt?: unknown;
  unitCount?: number;
  priceFrom?: number;
  builderName?: string;
  builder?: unknown;
}) {
  return {
    id: String(project._id),
    name: project.name,
    locality: project.locality,
    pinCode: project.pinCode,
    address: project.address ?? "",
    description: project.description,
    reraId: project.reraId,
    images: project.images,
    amenities: project.amenities,
    possessionDate: project.possessionDate ?? null,
    constructionStatus: project.constructionStatus,
    status: project.status,
    createdAt: project.createdAt,
    unitCount: project.unitCount ?? 0,
    priceFrom: project.priceFrom ?? null,
    builderName: project.builderName ?? "",
  };
}

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { locality } = req.query;
    const match: Record<string, unknown> = { status: "LIVE" };
    if (typeof locality === "string" && locality.trim()) {
      match.locality = new RegExp(locality.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }

    const projects = await Project.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "units",
          localField: "_id",
          foreignField: "projectId",
          as: "units",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "builderId",
          foreignField: "_id",
          as: "builder",
        },
      },
      {
        $project: {
          name: 1,
          locality: 1,
          pinCode: 1,
          address: 1,
          description: 1,
          reraId: 1,
          images: 1,
          amenities: 1,
          possessionDate: 1,
          constructionStatus: 1,
          status: 1,
          createdAt: 1,
          unitCount: { $size: "$units" },
          priceFrom: { $min: "$units.price" },
          builderName: { $arrayElemAt: ["$builder.name", 0] },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 24 },
    ]);

    res.json({ projects: projects.map(publicProject) });
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Project not found" });

    const project = await Project.findOne({ _id: id, status: "LIVE" })
      .populate("builderId", "name companyName phone verified")
      .lean();
    if (!project) return res.status(404).json({ error: "Project not found" });

    const units = await Unit.find({ projectId: id }).sort({ price: 1 }).lean();

    const builder =
      project.builderId && typeof project.builderId === "object" && "phone" in project.builderId
        ? {
            name: "name" in project.builderId ? project.builderId.name ?? "" : "",
            companyName: "companyName" in project.builderId ? project.builderId.companyName ?? "" : "",
            phone: project.builderId.phone,
            verified: "verified" in project.builderId ? Boolean(project.builderId.verified) : false,
          }
        : null;

    res.json({
      project: {
        id: project._id.toString(),
        name: project.name,
        locality: project.locality,
        pinCode: project.pinCode,
        address: project.address ?? "",
        description: project.description,
        reraId: project.reraId,
        images: project.images,
        amenities: project.amenities,
        possessionDate: project.possessionDate ?? null,
        constructionStatus: project.constructionStatus,
        status: project.status,
        createdAt: project.createdAt,
        builder,
        units: units.map((u) => ({
          id: u._id.toString(),
          type: u.type,
          areaSqft: u.areaSqft,
          price: u.price,
          floor: u.floor ?? "",
          availableUnits: u.availableUnits,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const unitsRaw = parseJsonField(req.body.units, "units");
    const unitsParsed = unitsRaw ? unitsArraySchema.safeParse(unitsRaw) : null;
    if (unitsParsed && !unitsParsed.success) {
      return res.status(400).json({ error: "Invalid units: add at least one unit type with a price and area" });
    }

    const files = req.files as { images?: Express.Multer.File[] };
    const images = files.images ?? [];
    if (images.length === 0) {
      return res.status(400).json({ error: "At least one project image is required" });
    }

    const uploadedImages = await Promise.all(
      images.map((file) => uploadBuffer(file.buffer, file.originalname, "thikana/projects", false))
    );

    const project = await Project.create({
      builderId: req.user!.userId,
      ...parsed.data,
      images: uploadedImages.map((img) => img.url),
      status: "PENDING",
    });

    if (unitsParsed && unitsParsed.data) {
      await Unit.insertMany(
        unitsParsed.data.map((unit) => ({ projectId: project._id, ...unit }))
      );
    }

    res.status(201).json({
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyProjects(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const projects = await Project.aggregate([
      { $match: { builderId: new Types.ObjectId(req.user!.userId) } },
      {
        $lookup: {
          from: "units",
          localField: "_id",
          foreignField: "projectId",
          as: "units",
        },
      },
      {
        $project: {
          name: 1,
          locality: 1,
          pinCode: 1,
          description: 1,
          images: 1,
          constructionStatus: 1,
          status: 1,
          createdAt: 1,
          unitCount: { $size: "$units" },
          priceFrom: { $min: "$units.price" },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json({ projects: projects.map(publicProject) });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Project not found" });

    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const project = await Project.findOneAndUpdate(
      { _id: id, builderId: req.user!.userId },
      parsed.data,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json({ project: { id: project._id.toString(), name: project.name, status: project.status } });
  } catch (err) {
    next(err);
  }
}

export async function addUnits(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Project not found" });

    const project = await Project.findOne({ _id: id, builderId: req.user!.userId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const unitsRaw = parseJsonField(req.body.units, "units");
    if (!unitsRaw) return res.status(400).json({ error: "Provide a units array" });
    const unitsParsed = unitsArraySchema.safeParse(unitsRaw);
    if (!unitsParsed.success) {
      return res.status(400).json({ error: "Invalid units: add at least one unit type with a price and area" });
    }

    const created = await Unit.insertMany(
      unitsParsed.data.map((unit) => ({ projectId: project._id, ...unit }))
    );

    res.status(201).json({ units: created.map((u) => ({ id: u._id.toString(), type: u.type, price: u.price })) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUnit(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Unit not found" });

    const unit = await Unit.findById(id).populate<{ projectId: { builderId: Types.ObjectId } }>(
      "projectId",
      "builderId"
    );
    if (!unit || !unit.projectId || typeof unit.projectId !== "object" || unit.projectId.builderId.toString() !== req.user!.userId) {
      return res.status(404).json({ error: "Unit not found" });
    }

    await unit.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
