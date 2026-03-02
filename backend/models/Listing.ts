import db from '../db.js';

export interface Listing {
  id?: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  price: number;
  type: string;
  quantity: number;
  status?: string;
  created_at?: string;
  images?: string[];
}

export class ListingModel {
  static async findAll(filters: { category?: any; tower?: any; search?: any }) {
    let query = `
      SELECT l.*, u.name as owner_name, u.tower, u.unit, u.profile_image_url as owner_image, c.name as category_name,
      (SELECT image_url FROM listing_images WHERE listing_id = l.id LIMIT 1) as primary_image
      FROM listings l 
      JOIN users u ON l.user_id = u.id 
      JOIN categories c ON l.category_id = c.id
      WHERE l.status = 'available'
    `;
    const params: any[] = [];

    if (filters.category) {
      query += " AND c.slug = ?";
      params.push(filters.category);
    }
    if (filters.tower) {
      query += " AND u.tower = ?";
      params.push(filters.tower);
    }
    if (filters.search) {
      query += " AND (l.title LIKE ? OR l.description LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += " ORDER BY l.created_at DESC";
    const [listings] = await db.query(query, params);
    return listings;
  }

  static async findById(id: number) {
    const [rows]: any = await db.query(`
      SELECT l.*, u.name as owner_name, u.tower, u.unit, u.profile_image_url as owner_image, c.name as category_name 
      FROM listings l 
      JOIN users u ON l.user_id = u.id 
      JOIN categories c ON l.category_id = c.id
      WHERE l.id = ?
    `, [id]);
    
    if (!rows[0]) return null;
    
    const [images]: any = await db.query("SELECT image_url FROM listing_images WHERE listing_id = ?", [id]);
    rows[0].images = images.map((img: any) => img.image_url);
    
    return rows[0];
  }

  static async create(listingData: Listing) {
    const [result]: any = await db.query(
      "INSERT INTO listings (user_id, category_id, title, description, price, type, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [listingData.user_id, listingData.category_id, listingData.title, listingData.description, listingData.price, listingData.type, listingData.quantity]
    );
    return result.insertId;
  }

  static async updateStatus(id: number, userId: number, status: string) {
    await db.query("UPDATE listings SET status = ? WHERE id = ? AND user_id = ?", [status, id, userId]);
  }

  static async findByUserId(userId: number) {
    const [listings] = await db.query(`
      SELECT l.*, c.name as category_name,
      (SELECT image_url FROM listing_images WHERE listing_id = l.id LIMIT 1) as primary_image
      FROM listings l 
      JOIN categories c ON l.category_id = c.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `, [userId]);
    return listings;
  }

  static async addImages(listingId: number, imageUrls: string[]) {
    const values = imageUrls.map((url, index) => [listingId, url, index === 0 ? 1 : 0]);
    await db.query("INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES ?", [values]);
  }

  static async checkCategoryExists(categoryId: number) {
    const [catRows]: any = await db.query("SELECT id FROM categories WHERE id = ?", [categoryId]);
    return catRows.length > 0;
  }
}
