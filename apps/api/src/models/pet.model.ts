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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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

export const Pet = models.Pet || model("Pet", petSchema);
