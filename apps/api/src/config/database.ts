import mongoose from "mongoose";

export async function connectDatabase(mongoUri?: string) {
  if (!mongoUri) {
    console.warn(
      "MONGODB_URI is not configured. The API will start without a database connection.",
    );
    return;
  }

  await mongoose.connect(mongoUri);
  console.info("MongoDB connection established.");
}
