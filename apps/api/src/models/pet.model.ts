import { Schema, model, models } from "mongoose";

const medicalHistoryEntrySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const petSchema = new Schema(
  {
    appId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userAppId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    sex: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },
    history: {
      type: [medicalHistoryEntrySchema],
      default: [],
    },
    imageUrls: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Pet: any = models.Pet || model("Pet", petSchema);
