import express from "express";
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from "multer";
import { loginLimiter, registerLimiter, validateRegister, validateLogin, validateFileUpload } from '../middleware/security.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", registerLimiter, validateRegister, AuthController.register);
router.post("/verify", authenticateToken, AuthController.verify);
router.post("/login", loginLimiter, validateLogin, AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", authenticateToken, AuthController.getMe);
router.patch("/update-profile", authenticateToken, upload.single('profile_image'), validateFileUpload, AuthController.updateProfile);

export default router;
