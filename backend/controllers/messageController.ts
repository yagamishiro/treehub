import { Request, Response } from "express";
import { MessageModel } from "../models/Message";
import { ListingModel } from "../models/Listing";
import { UserModel } from "../models/User";
import { uploadImage } from "../services/cloudinary";
import { sendMessageNotificationEmail } from "../services/email";
import db from "../db";

export class MessageController {
  static async getConversations(req: any, res: Response) {
    try {
      const conversations = await MessageModel.getConversations(req.user.id);
      res.json(conversations);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  }

  static async getMessages(req: any, res: Response) {
    const { listingId, otherUserId } = req.params;
    try {
      await MessageModel.markAsRead(parseInt(listingId), parseInt(otherUserId), req.user.id);
      const messages = await MessageModel.getMessages(parseInt(listingId), req.user.id, parseInt(otherUserId));
      res.json(messages);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }

  static async sendMessage(req: any, res: Response) {
    const { listing_id, receiver_id, content } = req.body;
    
    if (!listing_id || !receiver_id || (!content && !req.file)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const listing = await ListingModel.findById(parseInt(listing_id));
      const receiver = await UserModel.findById(parseInt(receiver_id));
      
      if (!listing) return res.status(400).json({ error: "Listing not found" });
      if (!receiver) return res.status(400).json({ error: "Receiver not found" });

      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadImage(req.file);
      }

      const messageId = await MessageModel.create({
        listing_id: parseInt(listing_id),
        sender_id: req.user.id,
        receiver_id: parseInt(receiver_id),
        content: content || (imageUrl ? "[Image]" : ""),
        image_url: imageUrl
      });
      
      // Create notification for receiver
      await db.query("INSERT INTO notifications (user_id, type, data) VALUES (?, ?, ?)", [
        receiver_id, 
        "message_received", 
        JSON.stringify({ listing_id, sender_name: req.user.name, sender_id: req.user.id, message_id: messageId })
      ]);

      // Send email notification
      try {
        await sendMessageNotificationEmail(
          receiver.email,
          req.user.name,
          listing.title,
          content || "Sent an image"
        );
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }

      res.json({ id: messageId, image_url: imageUrl });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to send message" });
    }
  }
}
