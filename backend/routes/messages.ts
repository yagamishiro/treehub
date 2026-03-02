import express from "express";
import multer from "multer";
import { MessageController } from "../controllers/messageController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authenticateToken, MessageController.getConversations);
router.get("/:listingId/:otherUserId", authenticateToken, MessageController.getMessages);
router.post("/", authenticateToken, upload.single('image'), MessageController.sendMessage);

export default router;
