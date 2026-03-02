import db from "../db";

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  tower: string;
  unit: string;
  profile_image_url?: string | null;
  is_verified?: number;
  verification_code?: string | null;
  created_at?: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const [rows]: any = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  }

  static async create(userData: User): Promise<number> {
    const [result]: any = await db.query(
      "INSERT INTO users (name, email, password, tower, unit, profile_image_url, verification_code, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userData.name,
        userData.email,
        userData.password,
        userData.tower,
        userData.unit,
        userData.profile_image_url || null,
        userData.verification_code,
        userData.is_verified
      ]
    );
    return result.insertId;
  }

  static async updateProfileImage(userId: number, imageUrl: string): Promise<void> {
    await db.query("UPDATE users SET profile_image_url = ? WHERE id = ?", [imageUrl, userId]);
  }

  static async updateFields(userId: number, fields: Partial<User>): Promise<void> {
    const keys = Object.keys(fields).filter(k => fields[k as keyof User] !== undefined);
    if (keys.length === 0) return;
    
    const query = `UPDATE users SET ${keys.map(k => `${k} = ?`).join(", ")} WHERE id = ?`;
    const values = [...keys.map(k => fields[k as keyof User]), userId];
    await db.query(query, values);
  }

  static async verify(userId: number): Promise<void> {
    await db.query("UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?", [userId]);
  }
}
