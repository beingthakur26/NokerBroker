import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { toPropertyView, type PropertyView } from "@/lib/serialize";

const OWNER_SELECT = "name whatsappNumber whatsappVerified";

export async function getLiveProperties(): Promise<PropertyView[]> {
  await dbConnect();
  const docs = await Property.find({ status: "ACTIVE" })
    .populate("ownerId", OWNER_SELECT)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toPropertyView);
}

export async function getPropertyBySlug(slug: string): Promise<PropertyView | null> {
  await dbConnect();
  const doc = await Property.findOne({ slug })
    .populate("ownerId", OWNER_SELECT)
    .lean();
  if (!doc) return null;
  await Property.updateOne({ _id: doc._id }, { $inc: { viewCount: 1 } });
  return toPropertyView(doc);
}

export async function getPropertiesByOwner(ownerId: string): Promise<PropertyView[]> {
  await dbConnect();
  const docs = await Property.find({ ownerId })
    .populate("ownerId", OWNER_SELECT)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toPropertyView);
}

export async function getAllPropertiesAdmin(): Promise<PropertyView[]> {
  await dbConnect();
  const docs = await Property.find()
    .populate("ownerId", OWNER_SELECT)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toPropertyView);
}
