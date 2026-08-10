import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { SavedSearch } from "../models/SavedSearch";
import { AuthedRequest } from "../middleware/auth.middleware";
import { createSavedSearchSchema } from "../validation/favorite.validation";

function toId(value: string) {
  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
}

export async function getMySavedSearches(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const searches = await SavedSearch.find({ userId: req.user!.userId })
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
  } catch (err) {
    next(err);
  }
}

export async function createSavedSearch(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createSavedSearchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const savedSearch = await SavedSearch.create({
      userId: req.user!.userId,
      name: parsed.data.name,
      filters: parsed.data.filters,
    });

    res.status(201).json({ savedSearch: { id: savedSearch._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function deleteSavedSearch(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = toId(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id) return res.status(404).json({ error: "Saved search not found" });

    const savedSearch = await SavedSearch.findOneAndDelete({ _id: id, userId: req.user!.userId });
    if (!savedSearch) return res.status(404).json({ error: "Saved search not found" });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
