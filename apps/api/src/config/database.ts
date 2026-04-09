import mongoose from "mongoose";
import { seedCoreDatabase } from "./seed-database";

export async function connectDatabase(mongoUri?: string) {
  if (!mongoUri) {
    console.warn(
      "MONGODB_URI is not configured. The API will start without a database connection.",
    );
    return;
  }

  await mongoose.connect(mongoUri);
  await seedCoreDatabase();
  console.info("MongoDB connection established.");
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
