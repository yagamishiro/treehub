import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { sendVerificationEmail } from "../services/email";
import { uploadImage } from "../services/cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "trees-residences-secret";

export class AuthController {
  static async register(req: Request, res: Response) {
    const { name, email, password, tower, unit } = req.body;
    const enableVerification = process.env.ENABLE_EMAIL_VERIFICATION === 'true';
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationCode = enableVerification ? Math.floor(100000 + Math.random() * 900000).toString() : null;
      const isVerified = enableVerification ? 0 : 1;
      
      const userId = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        tower,
        unit,
        profile_image_url: null,
        verification_code: verificationCode,
        is_verified: isVerified
      });
      
      if (enableVerification && verificationCode) {
        try {
          await sendVerificationEmail(email, verificationCode);
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
        }
      }

      const token = jwt.sign({ id: userId, email, name, tower, unit, profile_image_url: null, is_verified: isVerified }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ user: { id: userId, name, email, tower, unit, profile_image_url: null, is_verified: isVerified } });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Email already exists" });
    }
  }

  static async updateProfile(req: any, res: Response) {
    const { name, tower, unit } = req.body;
    const userId = req.user.id;
    
    try {
      let profileImageUrl = req.user.profile_image_url;
      
      if (req.file) {
        profileImageUrl = await uploadImage(req.file);
      }

      await UserModel.updateProfileImage(userId, profileImageUrl);
      // Also update other fields if provided
      if (name || tower || unit) {
        await UserModel.updateFields(userId, { name, tower, unit });
      }

      const updatedUser = await UserModel.findById(userId);
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const token = jwt.sign({ 
        id: updatedUser.id, 
        email: updatedUser.email, 
        name: updatedUser.name, 
        tower: updatedUser.tower, 
        unit: updatedUser.unit, 
        profile_image_url: updatedUser.profile_image_url,
        is_verified: updatedUser.is_verified 
      }, JWT_SECRET);
      
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ user: { 
        id: updatedUser.id, 
        name: updatedUser.name, 
        email: updatedUser.email, 
        tower: updatedUser.tower, 
        unit: updatedUser.unit, 
        profile_image_url: updatedUser.profile_image_url,
        is_verified: updatedUser.is_verified 
      } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }

  static async verify(req: any, res: Response) {
    const { code } = req.body;
    const user = await UserModel.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.is_verified) return res.json({ message: "Already verified" });
    if (user.verification_code !== code) return res.status(400).json({ error: "Invalid verification code" });

    await UserModel.verify(req.user.id);
    
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      tower: user.tower, 
      unit: user.unit, 
      profile_image_url: user.profile_image_url,
      is_verified: 1 
    }, JWT_SECRET);
    
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ message: "Account verified successfully", user: { ...user, is_verified: 1 } });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);
    
    if (!user || !(await bcrypt.compare(password, user.password!))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      tower: user.tower, 
      unit: user.unit, 
      profile_image_url: user.profile_image_url,
      is_verified: user.is_verified 
    }, JWT_SECRET);
    
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      tower: user.tower, 
      unit: user.unit, 
      profile_image_url: user.profile_image_url,
      is_verified: user.is_verified 
    } });
  }

  static logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  }

  static getMe(req: any, res: Response) {
    res.json({ user: req.user });
  }
}
