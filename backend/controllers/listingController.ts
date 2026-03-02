import { Request, Response } from "express";
import { ListingModel } from "../models/Listing";
import { uploadImage } from "../services/cloudinary";

export class ListingController {
  static async getAll(req: Request, res: Response) {
    const { category, tower, search } = req.query;
    try {
      const listings = await ListingModel.findAll({ category, tower, search });
      res.json(listings);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const listing = await ListingModel.findById(parseInt(req.params.id));
      if (!listing) return res.status(404).json({ error: "Listing not found" });
      res.json(listing);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  }

  static async create(req: any, res: Response) {
    const { title, description, category_id, price, type, quantity } = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!category_id) return res.status(400).json({ error: "Category is required" });
    if (!files || files.length === 0) return res.status(400).json({ error: "At least one image is required" });
    if (!type) return res.status(400).json({ error: "Type is required" });
    if (files.length > 5) return res.status(400).json({ error: "Maximum 5 images allowed" });
    
    try {
      const categoryExists = await ListingModel.checkCategoryExists(category_id);
      if (!categoryExists) return res.status(400).json({ error: "Invalid category" });

      const listingId = await ListingModel.create({
        user_id: req.user.id,
        category_id,
        title,
        description,
        price,
        type,
        quantity: parseInt(quantity) || 1
      });

      const imageUrls = await Promise.all(files.map(file => uploadImage(file)));
      await ListingModel.addImages(listingId, imageUrls);

      res.json({ id: listingId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create listing" });
    }
  }

  static async getMyListings(req: any, res: Response) {
    try {
      const listings = await ListingModel.findByUserId(req.user.id);
      res.json(listings);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch your listings" });
    }
  }

  static async updateStatus(req: any, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      await ListingModel.updateStatus(parseInt(id), req.user.id, status);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  }
}
