import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Listing } from "../models/Listing";
import { AuthedRequest } from "../middleware/auth.middleware";
import { createListingSchema } from "../validation/listing.validation";
import { searchListingsSchema } from "../validation/search.validation";
import { uploadBuffer } from "../utils/imagekitUpload";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createListing(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createListingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const files = req.files as { images?: Express.Multer.File[]; ownershipDoc?: Express.Multer.File[] };

    if (!files.images || files.images.length === 0) {
      return res.status(400).json({ error: "At least one property image is required" });
    }
    if (!files.ownershipDoc || files.ownershipDoc.length === 0) {
      return res.status(400).json({ error: "Ownership document is required for approval" });
    }

    const uploadedImages = await Promise.all(
      files.images.map((file) =>
        uploadBuffer(file.buffer, file.originalname, "thikana/listings", false)
      )
    );

    const uploadedDoc = await uploadBuffer(
      files.ownershipDoc[0].buffer,
      files.ownershipDoc[0].originalname,
      "thikana/ownership-docs",
      true
    );

    const listing = await Listing.create({
      ...parsed.data,
      ownerId: req.user!.userId,
      images: uploadedImages.map((img) => img.url),
      ownershipDocPath: uploadedDoc.filePath,
      status: "LIVE",
    });

    res.status(201).json({
      listing: {
        id: listing._id,
        type: listing.type,
        locality: listing.locality,
        price: listing.price,
        bhk: listing.bhk,
        status: listing.status,
        images: listing.images,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getLiveListings(req: Request, res: Response, next: NextFunction) {
  try {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string" && value.trim() === "") continue;
      clean[key] = value;
    }

    const parsed = searchListingsSchema.safeParse(clean);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const d = parsed.data;

    const hasFilters = Boolean(d.q || d.locality || d.type || d.bhk || d.minPrice !== undefined || d.maxPrice !== undefined);

    const query = Listing.find({ status: "LIVE" })
      .select("type locality pinCode price areaSqft bhk images status createdAt")
      .sort({ createdAt: -1 });

    if (d.q) {
      const pattern = new RegExp(escapeRegex(d.q), "i");
      query.or([{ locality: pattern }, { pinCode: pattern }]);
    }
    if (d.locality) {
      query.where("locality", new RegExp(escapeRegex(d.locality), "i"));
    }
    if (d.type) {
      query.where("type", d.type);
    }
    if (d.bhk) {
      query.where("bhk", d.bhk);
    }
    if (d.minPrice !== undefined || d.maxPrice !== undefined) {
      query.where("price");
      if (d.minPrice !== undefined) query.gte(d.minPrice);
      if (d.maxPrice !== undefined) query.lte(d.maxPrice);
    }

    const listings = await query.limit(hasFilters ? 24 : 6).lean();

    res.json({
      listings: listings.map((listing) => ({
        id: listing._id.toString(),
        type: listing.type,
        locality: listing.locality,
        pinCode: listing.pinCode,
        price: listing.price,
        areaSqft: listing.areaSqft,
        bhk: listing.bhk,
        images: listing.images,
        status: listing.status,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getListingById(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listing = await Listing.findOne({ _id: id, status: "LIVE" })
      .populate("ownerId", "name phone")
      .lean();

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const owner =
      listing.ownerId && typeof listing.ownerId === "object" && "phone" in listing.ownerId
        ? { name: "name" in listing.ownerId ? listing.ownerId.name ?? "" : "", phone: listing.ownerId.phone }
        : null;

    res.json({
      listing: {
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
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyListings(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const listings = await Listing.find({ ownerId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    next(err);
  }
}
