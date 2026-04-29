import multer from "multer";
import { AppError } from "./errorHandler.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Module 7: use memoryStorage — buffer is passed to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError("Only image files (JPEG, PNG, WebP) are allowed", 400) as unknown as null, false);
    }
    cb(null, true);
  },
});

export const uploadMemory = upload; // alias
