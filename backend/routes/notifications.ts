import express from "express";
import { NotificationController } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get("/", authenticateToken, NotificationController.getAll);
router.get("/unread-count", authenticateToken, NotificationController.getUnreadCount);
router.patch("/read", authenticateToken, NotificationController.markAsRead);

export default router;
