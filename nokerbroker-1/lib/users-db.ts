import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { toUserView, type UserView } from "@/lib/serialize";

export async function getAllUsersAdmin(): Promise<UserView[]> {
  await dbConnect();
  const docs = await User.find().sort({ createdAt: -1 }).lean();
  return docs.map(toUserView);
}
