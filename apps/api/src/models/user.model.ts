import { Schema, model, models } from "mongoose";
import { roles } from "../constants/roles";

const userSchema = new Schema(
  {
    appId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: roles,
      required: true,
      default: "user",
    },
    phone: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    doctorProfileId: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const User: any = models.User || model("User", userSchema);
