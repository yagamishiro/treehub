import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "trees_residences",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initDb() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        tower VARCHAR(50) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        profile_image_url VARCHAR(255),
        is_verified TINYINT DEFAULT 0,
        verification_code VARCHAR(10),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2),
        type VARCHAR(50) NOT NULL DEFAULT 'sale',
        quantity INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS listing_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        listing_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        is_primary TINYINT DEFAULT 0,
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        listing_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        is_read TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        data TEXT,
        is_read TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // Seed Categories
    const [rows]: any = await connection.query("SELECT COUNT(*) as count FROM categories");
    if (rows[0].count === 0) {
      const categories = [
        ["Tools", "tools"],
        ["Printing & Office", "printing-office"],
        ["Electronics", "electronics"],
        ["Household Items", "household-items"],
        ["Services", "services"],
        ["Sports & Outdoors", "sports-outdoors"],
        ["Toys & Games", "toys-games"],
        ["Books & Media", "books-media"],
        ["Clothing & Accessories", "clothing-accessories"],
        ["Vehicles", "vehicles"],
        ["Other", "other"],
      ];
      await connection.query("INSERT INTO categories (name, slug) VALUES ?", [categories]);
    }
  } finally {
    connection.release();
  }
}

export default pool;
