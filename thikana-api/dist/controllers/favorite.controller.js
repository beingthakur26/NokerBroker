"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyFavorites = getMyFavorites;
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
const mongoose_1 = require("mongoose");
const Favorite_1 = require("../models/Favorite");
const Listing_1 = require("../models/Listing");
const Project_1 = require("../models/Project");
const favorite_validation_1 = require("../validation/favorite.validation");
function toId(value) {
    return mongoose_1.Types.ObjectId.isValid(value) ? new mongoose_1.Types.ObjectId(value) : null;
}
async function getMyFavorites(req, res, next) {
    try {
        const favorites = await Favorite_1.Favorite.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .lean();
        const listingIds = favorites.filter((f) => f.targetType === "LISTING").map((f) => f.targetId);
        const projectIds = favorites.filter((f) => f.targetType === "PROJECT").map((f) => f.targetId);
        const [listings, projects] = await Promise.all([
            listingIds.length
                ? Listing_1.Listing.find({ _id: { $in: listingIds } })
                    .select("type locality pinCode price areaSqft bhk images status")
                    .lean()
                : [],
            projectIds.length
                ? Project_1.Project.find({ _id: { $in: projectIds } })
                    .select("name locality pinCode images status")
                    .lean()
                : [],
        ]);
        const listingMap = new Map(listings.map((l) => [l._id.toString(), l]));
        const projectMap = new Map(projects.map((p) => [p._id.toString(), p]));
        res.json({
            favorites: favorites.map((f) => {
                const listing = listingMap.get(f.targetId.toString());
                const project = projectMap.get(f.targetId.toString());
                return {
                    id: f._id.toString(),
                    targetType: f.targetType,
                    targetId: f.targetId.toString(),
                    listing: listing
                        ? {
                            id: listing._id.toString(),
                            type: listing.type,
                            locality: listing.locality,
                            pinCode: listing.pinCode,
                            price: listing.price,
                            areaSqft: listing.areaSqft,
                            bhk: listing.bhk,
                            images: listing.images,
                            status: listing.status,
                        }
                        : null,
                    project: project
                        ? {
                            id: project._id.toString(),
                            name: project.name,
                            locality: project.locality,
                            images: project.images,
                            status: project.status,
                        }
                        : null,
                };
            }),
        });
    }
    catch (err) {
        next(err);
    }
}
async function addFavorite(req, res, next) {
    try {
        const parsed = favorite_validation_1.addFavoriteSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.issues[0].message });
        const targetId = toId(parsed.data.targetId);
        if (!targetId)
            return res.status(404).json({ error: "Target not found" });
        if (parsed.data.targetType === "LISTING") {
            const listing = await Listing_1.Listing.exists({ _id: targetId, status: "LIVE" });
            if (!listing)
                return res.status(404).json({ error: "Listing not found" });
        }
        else {
            const project = await Project_1.Project.exists({ _id: targetId, status: "LIVE" });
            if (!project)
                return res.status(404).json({ error: "Project not found" });
        }
        const favorite = await Favorite_1.Favorite.findOneAndUpdate({ userId: req.user.userId, targetType: parsed.data.targetType, targetId }, { userId: req.user.userId, targetType: parsed.data.targetType, targetId }, { upsert: true, new: true });
        res.status(201).json({ favorite: { id: favorite._id.toString() } });
    }
    catch (err) {
        next(err);
    }
}
async function removeFavorite(req, res, next) {
    try {
        const rawId = req.params.id;
        const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!id)
            return res.status(404).json({ error: "Favorite not found" });
        const favorite = await Favorite_1.Favorite.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!favorite)
            return res.status(404).json({ error: "Favorite not found" });
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
}
