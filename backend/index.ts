import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import db, { initDb } from './db.js';
import csrf from 'csurf';

// Route Imports
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());
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
  // CSRF token endpoint
  const csrfProtection = csrf({ cookie: true });
  app.use(csrfProtection);

  app.get('/api/csrf-token', (_req, res) => {
    res.json({ csrfToken: (_req as any).csrfToken() });
  });
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
