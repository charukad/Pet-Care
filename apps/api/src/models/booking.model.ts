import { Schema, model, models } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      index: true,
    },
    doctorProfileId: {
      type: String,
      required: true,
      index: true,
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
    },
    petProfileId: {
      type: String,
      required: true,
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

bookingSchema.index({ doctorId: 1, scheduledAt: 1 });

export const Booking = models.Booking || model("Booking", bookingSchema);
