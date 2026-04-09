import { Schema, model, models } from "mongoose";

const attachmentSchema = new Schema(
  {
    fileName: { type: String, trim: true },
    fileUrl: { type: String, trim: true },
  },
  { _id: false },
);

const messageSchema = new Schema(
  {
    appId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      trim: true,
    },
    receiverId: {
      type: String,
      required: true,
      trim: true,
    },
    bookingId: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Message: any = models.Message || model("Message", messageSchema);
