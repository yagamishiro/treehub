import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import db, { initDb } from './db.js';

// Route Imports
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const FRONTEND_URL = process.env.FRONTEND_URL

app.use(cors({
  origin: FRONTEND_URL,
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/categories", async (_req, res) => {
  const [categories] = await db.query("SELECT * FROM categories");
  res.json(categories);
});

app.get("/api/feature-flags", (_req, res) => {
  res.json({
    enable_email_verification: process.env.ENABLE_EMAIL_VERIFICATION === "true",
    enable_in_app_notifications: process.env.ENABLE_IN_APP_NOTIFICATIONS === "true",
    enable_email_notifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === "true",
    enable_web_push_notifications: process.env.ENABLE_WEB_PUSH_NOTIFICATIONS === "true",
    enable_messaging: process.env.ENABLE_MESSAGING === "true",
    enable_listing_photos: process.env.ENABLE_LISTING_PHOTOS === "true",
    limit_listings_per_user: parseInt(process.env.LIMIT_LISTINGS_PER_USER || "10"),
  });
});

// Start backend server
async function startServer() {
  await initDb();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });
}

startServer();
