import dbConnect from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { toInquiryView, type InquiryView } from "@/lib/serialize";

const SENDER_SELECT = "name email whatsappNumber whatsappVerified";

async function baseQuery(pipeline: Record<string, unknown>) {
  await dbConnect();
  const docs = await Inquiry.find(pipeline)
    .populate("senderId", SENDER_SELECT)
    .populate("recipientId", SENDER_SELECT)
    .populate("propertyId", "title slug")
    .populate("projectId", "name slug")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toInquiryView);
}

export async function getSentInquiries(userId: string): Promise<InquiryView[]> {
  return baseQuery({ senderId: userId });
}

export async function getReceivedInquiries(ownerPropertyIds: string[], ownerProjectIds: string[], recipientId?: string): Promise<InquiryView[]> {
  if (recipientId) return baseQuery({ recipientId });
  if (ownerPropertyIds.length === 0 && ownerProjectIds.length === 0) return [];
  const or: { propertyId?: unknown; projectId?: unknown }[] = [];
  if (ownerPropertyIds.length > 0) or.push({ propertyId: { $in: ownerPropertyIds } });
  if (ownerProjectIds.length > 0) or.push({ projectId: { $in: ownerProjectIds } });
  return baseQuery({ $or: or });
}

export async function getAllInquiriesAdmin(): Promise<InquiryView[]> {
  return baseQuery({});
}
