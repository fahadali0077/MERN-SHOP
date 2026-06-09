import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env["CLOUDINARY_CLOUD_NAME"];
const API_KEY = process.env["CLOUDINARY_API_KEY"];
const API_SECRET = process.env["CLOUDINARY_API_SECRET"];

// FIX A7: don't crash the whole app at boot if Cloudinary isn't configured
// (image upload is an optional, admin-only feature). Warn once so the failure is
// diagnosable instead of surfacing as a cryptic error on first upload.
export const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);
if (!isCloudinaryConfigured) {
  console.warn(
    "[cloudinary] CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET not fully set. " +
      "Product image uploads will fail until these are configured (see .env.example)."
  );
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export const uploadToCloudinary = (buffer: Buffer, folder = "mernshop/products"): Promise<string> => {
  if (!isCloudinaryConfigured) {
    return Promise.reject(new Error("Cloudinary is not configured on the server."));
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 800, crop: "limit" },
          { fetch_format: "auto", quality: "auto" },
        ],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
