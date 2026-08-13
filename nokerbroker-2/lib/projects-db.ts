// lib/projects-db.ts
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { toProjectView, type ProjectView } from "@/lib/serialize";

const BUILDER_SELECT = "name whatsappNumber whatsappVerified";

export async function getLiveProjects(): Promise<ProjectView[]> {
  try {
    await dbConnect();
    const docs = await Project.find({ status: "LIVE" })
      .populate("builderId", BUILDER_SELECT)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(toProjectView);
  } catch (error) {
    console.error("[projects-db] Failed to fetch live projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectView | null> {
  try {
    await dbConnect();
    const doc = await Project.findOne({ slug, status: "LIVE" })
      .populate("builderId", BUILDER_SELECT)
      .lean();
    if (!doc) return null;
    return toProjectView(doc);
  } catch (error) {
    console.error(`[projects-db] Failed to fetch project by slug (${slug}):`, error);
    return null;
  }
}

export async function getProjectsByBuilder(builderId: string): Promise<ProjectView[]> {
  try {
    await dbConnect();
    const docs = await Project.find({ builderId })
      .populate("builderId", BUILDER_SELECT)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(toProjectView);
  } catch (error) {
    console.error(`[projects-db] Failed to fetch projects by builder (${builderId}):`, error);
    return [];
  }
}

export async function getAllProjectsAdmin(): Promise<ProjectView[]> {
  try {
    await dbConnect();
    const docs = await Project.find()
      .populate("builderId", BUILDER_SELECT)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(toProjectView);
  } catch (error) {
    console.error("[projects-db] Failed to fetch all projects for admin:", error);
    return [];
  }
}
