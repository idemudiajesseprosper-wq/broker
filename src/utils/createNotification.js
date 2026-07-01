import Notification from "@/models/Notification";

export async function createNotification(userId, title, message, type) {
  return Notification.create({
    message,
    title,
    type,
    userId,
  });
}
