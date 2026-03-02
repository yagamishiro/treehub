import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import csurf from 'csurf';

// Rate limiting middleware for login and register
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many registration attempts, please try again later.'
});

// CSRF protection middleware
export const csrfProtection = csurf({ cookie: true });

// Validation and sanitization middleware for registration
export const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('tower').trim().escape(),
  body('unit').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation and sanitization middleware for login
export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// File upload validation (for profile images)
export function validateFileUpload(req, res, next) {
  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type.' });
    }
    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 2MB.' });
    }
  }
  next();
}
