import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { toProjectView, type ProjectView } from "@/lib/serialize";

const BUILDER_SELECT = "name whatsappNumber whatsappVerified";

export async function getLiveProjects(): Promise<ProjectView[]> {
  await dbConnect();
  const docs = await Project.find({ status: "LIVE" })
    .populate("builderId", BUILDER_SELECT)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toProjectView);
}

export async function getProjectBySlug(slug: string): Promise<ProjectView | null> {
  await dbConnect();
  const doc = await Project.findOne({ slug })
    .populate("builderId", BUILDER_SELECT)
    .lean();
  if (!doc) return null;
  return toProjectView(doc);
}

export async function getProjectsByBuilder(builderId: string): Promise<ProjectView[]> {
  await dbConnect();
  const docs = await Project.find({ builderId })
    .populate("builderId", BUILDER_SELECT)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toProjectView);
}

export async function getAllProjectsAdmin(): Promise<ProjectView[]> {
  await dbConnect();
  const docs = await Project.find()
    .populate("builderId", BUILDER_SELECT)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toProjectView);
}
