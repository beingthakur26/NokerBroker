// lib/properties-db.ts
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { toPropertyView, type PropertyView } from "@/lib/serialize";

const OWNER_SELECT = "name whatsappNumber whatsappVerified";

export async function getLiveProperties(): Promise<PropertyView[]> {
  try {
    await dbConnect();
    const docs = await Property.find({ status: "ACTIVE" })
      .populate("ownerId", OWNER_SELECT)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(toPropertyView);
  } catch (error) {
    console.error("[properties-db] Failed to fetch live properties:", error);
    return [];
  }
}

export async function getPropertyBySlug(slug: string): Promise<PropertyView | null> {
  try {
    await dbConnect();
    const doc = await Property.findOne({ slug, status: "ACTIVE" })
      .populate("ownerId", OWNER_SELECT)
      .lean();
    if (!doc) return null;
    await Property.updateOne({ _id: doc._id }, { $inc: { viewCount: 1 } }).catch(() => {});
    return toPropertyView(doc);
  } catch (error) {
    console.error(`[properties-db] Failed to fetch property by slug (${slug}):`, error);
    return null;
  }
}

export async function getPropertiesByOwner(ownerId: string): Promise<PropertyView[]> {
  try {
    await dbConnect();
    const docs = await Property.find({ ownerId })
      .populate("ownerId", OWNER_SELECT)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(toPropertyView);
  } catch (error) {
    console.error(`[properties-db] Failed to fetch properties by owner (${ownerId}):`, error);
    return [];
  }
}

export async function getAllPropertiesAdmin(): Promise<PropertyView[]> {
  try {
    await dbConnect();
    const docs = await Property.find()
      .populate("ownerId", OWNER_SELECT)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(toPropertyView);
  } catch (error) {
    console.error("[properties-db] Failed to fetch all properties for admin:", error);
    return [];
  }
}
