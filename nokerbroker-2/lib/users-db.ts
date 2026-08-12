// lib/users-db.ts
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { toUserView, type UserView } from "@/lib/serialize";

export async function getAllUsersAdmin(): Promise<UserView[]> {
  try {
    await dbConnect();
    const docs = await User.find().sort({ createdAt: -1 }).lean();
    return docs.map(toUserView);
  } catch (error) {
    console.error("[users-db] Failed to fetch users for admin:", error);
    return [];
  }
}
