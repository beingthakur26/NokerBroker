"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListing = createListing;
exports.getLiveListings = getLiveListings;
exports.getListingById = getListingById;
exports.getMyListings = getMyListings;
const mongoose_1 = require("mongoose");
const Listing_1 = require("../models/Listing");
const listing_validation_1 = require("../validation/listing.validation");
const search_validation_1 = require("../validation/search.validation");
const imagekitUpload_1 = require("../utils/imagekitUpload");
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function createListing(req, res, next) {
    try {
        const parsed = listing_validation_1.createListingSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }
        const files = req.files;
        if (!files.images || files.images.length === 0) {
            return res.status(400).json({ error: "At least one property image is required" });
        }
        if (!files.ownershipDoc || files.ownershipDoc.length === 0) {
            return res.status(400).json({ error: "Ownership document is required for approval" });
        }
        const uploadedImages = await Promise.all(files.images.map((file) => (0, imagekitUpload_1.uploadBuffer)(file.buffer, file.originalname, "thikana/listings", false)));
        const uploadedDoc = await (0, imagekitUpload_1.uploadBuffer)(files.ownershipDoc[0].buffer, files.ownershipDoc[0].originalname, "thikana/ownership-docs", true);
        const listing = await Listing_1.Listing.create({
            ...parsed.data,
            ownerId: req.user.userId,
            images: uploadedImages.map((img) => img.url),
            ownershipDocPath: uploadedDoc.filePath,
            status: "PENDING",
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
    }
    catch (err) {
        next(err);
    }
}
async function getLiveListings(req, res, next) {
    try {
        const clean = {};
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === "string" && value.trim() === "")
                continue;
            clean[key] = value;
        }
        const parsed = search_validation_1.searchListingsSchema.safeParse(clean);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }
        const d = parsed.data;
        const hasFilters = Boolean(d.q ||
            d.locality ||
            d.type ||
            d.bhk ||
            d.minBhk ||
            d.minPrice !== undefined ||
            d.maxPrice !== undefined);
        const filter = { status: "LIVE" };
        if (d.q) {
            const pattern = new RegExp(escapeRegex(d.q), "i");
            filter.$or = [{ locality: pattern }, { pinCode: pattern }];
        }
        if (d.locality) {
            filter.locality = new RegExp(escapeRegex(d.locality), "i");
        }
        if (d.type) {
            filter.type = d.type;
        }
        if (d.bhk) {
            filter.bhk = d.bhk;
        }
        if (d.minBhk) {
            filter.bhk = { $gte: d.minBhk };
        }
        if (d.minPrice !== undefined || d.maxPrice !== undefined) {
            const priceFilter = {};
            if (d.minPrice !== undefined)
                priceFilter.$gte = d.minPrice;
            if (d.maxPrice !== undefined)
                priceFilter.$lte = d.maxPrice;
            filter.price = priceFilter;
        }
        const sort = d.sort === "price_asc"
            ? { price: 1 }
            : d.sort === "price_desc"
                ? { price: -1 }
                : { createdAt: -1 };
        const total = await Listing_1.Listing.countDocuments(filter);
        const listings = await Listing_1.Listing.find(filter)
            .select("type locality pinCode price areaSqft bhk description amenities images status createdAt")
            .sort(sort)
            .skip((d.page - 1) * d.limit)
            .limit(hasFilters ? d.limit : 6)
            .lean();
        res.json({
            listings: listings.map((listing) => ({
                id: listing._id.toString(),
                type: listing.type,
                locality: listing.locality,
                pinCode: listing.pinCode,
                price: listing.price,
                areaSqft: listing.areaSqft,
                bhk: listing.bhk,
                description: listing.description ?? "",
                amenities: listing.amenities ?? [],
                images: listing.images,
                status: listing.status,
            })),
            total,
            page: d.page,
            limit: d.limit,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getListingById(req, res, next) {
    try {
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Listing not found" });
        }
        const listing = await Listing_1.Listing.findOne({ _id: id, status: "LIVE" })
            .populate("ownerId", "name phone")
            .lean();
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        const owner = listing.ownerId && typeof listing.ownerId === "object" && "phone" in listing.ownerId
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
                description: listing.description ?? "",
                amenities: listing.amenities ?? [],
                images: listing.images,
                status: listing.status,
                createdAt: listing.createdAt,
                owner,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function getMyListings(req, res, next) {
    try {
        const listings = await Listing_1.Listing.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ listings });
    }
    catch (err) {
        next(err);
    }
}
