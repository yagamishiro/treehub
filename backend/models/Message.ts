import db from "../db";

export interface Message {
  id?: number;
  listing_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  image_url?: string | null;
  is_read?: number;
  created_at?: string;
}

export class MessageModel {
  static async getConversations(userId: number) {
    const [conversations] = await db.query(`
      SELECT 
        l.id as listing_id, l.title as listing_title,
        u.id as other_user_id, u.name as other_user_name, u.tower, u.unit,
        (SELECT content FROM messages 
         WHERE listing_id = l.id AND ((sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?))
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE listing_id = l.id AND ((sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?))
         ORDER BY created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages 
         WHERE listing_id = l.id AND sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
      FROM messages m
      JOIN listings l ON m.listing_id = l.id
      JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id) AND u.id != ?
      WHERE m.sender_id = ? OR m.receiver_id = ?
      GROUP BY l.id, u.id
      ORDER BY last_message_at DESC
    `, [userId, userId, userId, userId, userId, userId, userId, userId]);
    return conversations;
  }

  static async getMessages(listingId: number, userId: number, otherUserId: number) {
    const [messages] = await db.query(`
      SELECT m.*, u_sender.name as sender_name, u_sender.profile_image_url as sender_profile_image_url
      FROM messages m
      JOIN users u_sender ON m.sender_id = u_sender.id
      WHERE m.listing_id = ? AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
      ORDER BY m.created_at ASC
    `, [listingId, userId, otherUserId, otherUserId, userId]);
    return messages;
  }

  static async markAsRead(listingId: number, otherUserId: number, userId: number) {
    await db.query("UPDATE messages SET is_read = 1 WHERE listing_id = ? AND sender_id = ? AND receiver_id = ?", [listingId, otherUserId, userId]);
  }

  static async create(messageData: Message) {
    const [result]: any = await db.query(
      "INSERT INTO messages (listing_id, sender_id, receiver_id, content, image_url) VALUES (?, ?, ?, ?, ?)",
      [
        messageData.listing_id, 
        messageData.sender_id, 
        messageData.receiver_id, 
        messageData.content, 
        messageData.image_url
      ]
    );
    return result.insertId;
  }
}
