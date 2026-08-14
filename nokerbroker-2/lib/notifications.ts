import Notification from "@/models/Notification";

export async function createNotification(
  userId: string,
  type: "LISTING_LIVE" | "NEW_INQUIRY" | "LOAN_STATUS" | "SAVED_SEARCH_MATCH",
  message: string
) {
  return Notification.create({ userId, type, message: message.slice(0, 500) });
}
