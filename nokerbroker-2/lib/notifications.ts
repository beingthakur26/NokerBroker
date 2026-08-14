import Notification from "@/models/Notification";
import User from "@/models/User";
import { sendNotificationEmail } from "@/lib/email";

export type NotificationType = "LISTING_LIVE" | "NEW_INQUIRY" | "INQUIRY_REPLY" | "INQUIRY_CLOSED" | "LOAN_STATUS" | "SAVED_SEARCH_MATCH" | "SECURITY_EVENT";

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  link?: string
) {
  const user = await User.findById(userId, "email notificationPreferences").lean();
  if (!user) return null;
  const preferences = user.notificationPreferences ?? { inApp: true, email: true };
  const safeMessage = message.slice(0, 500);
  const notification = preferences.inApp !== false
    ? await Notification.create({ userId, type, message: safeMessage, link })
    : null;
  if (preferences.email !== false && user.email && !user.email.endsWith("@placeholder.nokerbroker.in")) {
    try {
      await sendNotificationEmail(user.email, notificationSubject(type), safeMessage, link);
    } catch (error) {
      console.error("[notifications] Email delivery failed", error);
    }
  }
  return notification;
}

function notificationSubject(type: NotificationType) {
  const labels: Record<NotificationType, string> = {
    LISTING_LIVE: "Your listing is live",
    NEW_INQUIRY: "You have a new inquiry",
    INQUIRY_REPLY: "You have a new inquiry reply",
    INQUIRY_CLOSED: "An inquiry was closed",
    LOAN_STATUS: "Your loan application was updated",
    SAVED_SEARCH_MATCH: "A listing matches your saved search",
    SECURITY_EVENT: "Security update for your NokerBroker account",
  };
  return labels[type];
}
