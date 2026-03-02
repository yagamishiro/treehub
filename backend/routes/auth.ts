import express from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import multer from "multer";
import { loginLimiter, registerLimiter, validateRegister, validateLogin, csrfProtection, validateFileUpload } from "../middleware/security";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", registerLimiter, validateRegister, csrfProtection, AuthController.register);
router.post("/verify", authenticateToken, AuthController.verify);
router.post("/login", loginLimiter, validateLogin, csrfProtection, AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", authenticateToken, AuthController.getMe);
router.patch("/update-profile", authenticateToken, csrfProtection, upload.single('profile_image'), validateFileUpload, AuthController.updateProfile);

export default router;
