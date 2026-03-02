import { Response } from "express";
import { NotificationModel } from "../models/Notification";

export class NotificationController {
  static async getAll(req: any, res: Response) {
    try {
      const notifications = await NotificationModel.findAllByUserId(req.user.id);
      res.json(notifications);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }

  static async getUnreadCount(req: any, res: Response) {
    try {
      const counts = await NotificationModel.getUnreadCounts(req.user.id);
      res.json(counts);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch unread counts" });
    }
  }

  static async markAsRead(req: any, res: Response) {
    try {
      await NotificationModel.markAllAsRead(req.user.id);
      res.json({ message: "Marked as read" });
    } catch (e) {
      res.status(500).json({ error: "Failed to mark as read" });
    }
  }
}
