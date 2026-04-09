import { Schema, model, models } from "mongoose";

const medicineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true },
    instructions: { type: String, trim: true },
  },
  { _id: false },
);

const prescriptionSchema = new Schema(
  {
    appId: {
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
      index: true,
    },
    petAppId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    bookingAppId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    followUp: {
      type: String,
      trim: true,
    },
    medicines: {
      type: [medicineSchema],
      default: [],
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Prescription: any =
  models.Prescription || model("Prescription", prescriptionSchema);
