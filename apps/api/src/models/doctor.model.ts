import { Schema, model, models } from "mongoose";

const availabilityWindowSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false },
);

const availabilitySlotSchema = new Schema(
  {
    dayOfWeek: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      required: true,
    },
    windows: {
      type: [availabilityWindowSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const doctorSchema = new Schema(
  {
    doctorProfileId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userAppId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },
    consultationFee: {
      type: Number,
      min: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    profileImageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ ratingAverage: -1 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Doctor: any = models.Doctor || model("Doctor", doctorSchema);
