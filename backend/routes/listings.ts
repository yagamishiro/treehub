import express from "express";
import multer from "multer";
import { ListingController } from "../controllers/listingController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", ListingController.getAll);
router.get("/my", authenticateToken, ListingController.getMyListings);
router.get("/:id", ListingController.getById);
router.post("/", authenticateToken, upload.array('images', 5), ListingController.create);
router.patch("/:id/status", authenticateToken, ListingController.updateStatus);

export default router;
