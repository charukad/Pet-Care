import { Schema, model, models } from "mongoose";

const reviewSchema = new Schema(
  {
    appId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    bookingAppId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    doctorProfileId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userAppId: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Review: any = models.Review || model("Review", reviewSchema);
