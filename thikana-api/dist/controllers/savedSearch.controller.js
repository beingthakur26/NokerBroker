"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySavedSearches = getMySavedSearches;
exports.createSavedSearch = createSavedSearch;
exports.deleteSavedSearch = deleteSavedSearch;
const mongoose_1 = require("mongoose");
const SavedSearch_1 = require("../models/SavedSearch");
const favorite_validation_1 = require("../validation/favorite.validation");
function toId(value) {
    return mongoose_1.Types.ObjectId.isValid(value) ? new mongoose_1.Types.ObjectId(value) : null;
}
async function getMySavedSearches(req, res, next) {
    try {
        const searches = await SavedSearch_1.SavedSearch.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            savedSearches: searches.map((s) => ({
                id: s._id.toString(),
                name: s.name,
                filters: s.filters,
                createdAt: s.createdAt,
            })),
        });
    }
    catch (err) {
        next(err);
    }
}
async function createSavedSearch(req, res, next) {
    try {
        const parsed = favorite_validation_1.createSavedSearchSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.issues[0].message });
        const savedSearch = await SavedSearch_1.SavedSearch.create({
            userId: req.user.userId,
            name: parsed.data.name,
            filters: parsed.data.filters,
        });
        res.status(201).json({ savedSearch: { id: savedSearch._id.toString() } });
    }
    catch (err) {
        next(err);
    }
}
async function deleteSavedSearch(req, res, next) {
    try {
        const rawId = req.params.id;
        const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
        if (!id)
            return res.status(404).json({ error: "Saved search not found" });
        const savedSearch = await SavedSearch_1.SavedSearch.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!savedSearch)
            return res.status(404).json({ error: "Saved search not found" });
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
}
