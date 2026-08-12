// lib/favorites-db.ts
import dbConnect from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import Property from "@/models/Property";
import Project from "@/models/Project";
import { toPropertyView, toProjectView, type ProjectView } from "@/lib/serialize";
import type { PropertyView } from "@/lib/properties";

export async function getFavoriteViews(userId: string): Promise<{
  properties: PropertyView[];
  projects: ProjectView[];
}> {
  try {
    await dbConnect();
    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 }).lean();
    const propertyIds = favorites
      .map((favorite) => favorite.propertyId)
      .filter(Boolean)
      .map(String);
    const projectIds = favorites
      .map((favorite) => favorite.projectId)
      .filter(Boolean)
      .map(String);

    const [properties, projects] = await Promise.all([
      propertyIds.length
        ? Property.find({ _id: { $in: propertyIds } })
            .populate("ownerId", "name whatsappNumber whatsappVerified")
            .lean()
        : [],
      projectIds.length
        ? Project.find({ _id: { $in: projectIds } })
            .populate("builderId", "name whatsappNumber whatsappVerified")
            .lean()
        : [],
    ]);

    return {
      properties: properties.map(toPropertyView),
      projects: projects.map(toProjectView),
    };
  } catch (error) {
    console.error("[favorites-db] Failed to fetch favorites:", error);
    return { properties: [], projects: [] };
  }
}
