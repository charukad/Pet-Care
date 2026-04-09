import { Schema, model, models } from "mongoose";

const notificationSchema = new Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["booking", "reminder", "prescription", "system", "payment"],
      default: "system",
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Notification: any =
  models.Notification || model("Notification", notificationSchema);
