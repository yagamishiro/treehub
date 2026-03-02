import express from "express";
import { NotificationController } from "../controllers/notificationController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/", authenticateToken, NotificationController.getAll);
router.get("/unread-count", authenticateToken, NotificationController.getUnreadCount);
router.patch("/read", authenticateToken, NotificationController.markAsRead);

export default router;
