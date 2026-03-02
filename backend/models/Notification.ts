import db from "../db";

export interface Notification {
  id?: number;
  user_id: number;
  type: string;
  data: string;
  is_read?: number;
  created_at?: string;
}

export class NotificationModel {
  static async findAllByUserId(userId: number) {
    const [notifications] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return notifications;
  }

  static async getUnreadCounts(userId: number) {
    const [notifRows]: any = await db.query("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0", [userId]);
    const [msgRows]: any = await db.query("SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0", [userId]);
    return {
      notifications: notifRows[0].count,
      messages: msgRows[0].count
    };
  }

  static async markAllAsRead(userId: number) {
    await db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
  }
}
