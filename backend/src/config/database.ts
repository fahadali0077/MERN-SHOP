import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    console.error("❌  MONGODB_URI is not set in .env");
    process.exit(1);
  }

  let retries = 5;

  while (retries > 0) {
    try {
      await mongoose.connect(uri);
      console.log("✅  MongoDB connected");
      return;
    } catch (err) {
      retries--;
      console.error(
        `❌  MongoDB connection failed. Retrying... (${retries} attempts left)`
      );
      if (retries === 0) {
        console.error("💥  Could not connect to MongoDB. Exiting.");
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("🔌  MongoDB disconnected");
};
