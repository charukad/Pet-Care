import { Schema, model, models } from "mongoose";

const bookingStatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      required: true,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    actorRole: {
      type: String,
      enum: ["user", "doctor", "admin"],
      required: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const bookingSchema = new Schema(
  {
    appId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userAppId: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
    doctorProfileId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    petAppId: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    consultationMode: {
      type: String,
      enum: ["Clinic", "Video"],
      default: "Clinic",
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 15,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    statusHistory: {
      type: [bookingStatusHistorySchema],
      default: [],
    },
    meetingUrl: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ doctorProfileId: 1, scheduledAt: 1 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Booking: any = models.Booking || model("Booking", bookingSchema);
