import { randomUUID } from "node:crypto";
import { isDatabaseConnected } from "../config/database";
import { Notification } from "../models/notification.model";
import { HttpError } from "../utils/http-error";

export type NotificationType =
  | "booking"
  | "reminder"
  | "prescription"
  | "system"
  | "payment";

export type NotificationMetadata = {
  bookingId?: string;
  prescriptionId?: string;
  status?: string;
  reminderStage?: "24h" | "1h";
  consultationMode?: "Clinic" | "Video";
};

export type NotificationView = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsFeed = {
  items: NotificationView[];
  unreadCount: number;
};

type NotificationRecord = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

type DbNotification = {
  appId: string;
  userAppId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
  readAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const fallbackNotifications: NotificationRecord[] = [];

function createTimestamp() {
  return new Date().toISOString();
}

function toIso(value: Date | string | undefined) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

function mapNotificationRecord(notification: NotificationRecord): NotificationView {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    metadata: notification.metadata,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

function mapDbNotification(notification: DbNotification): NotificationView {
  return {
    id: notification.appId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    metadata: notification.metadata,
    readAt: toIso(notification.readAt),
    createdAt: toIso(notification.createdAt) ?? createTimestamp(),
    updatedAt: toIso(notification.updatedAt) ?? createTimestamp(),
  };
}

function sortNotifications(items: NotificationView[]) {
  return [...items].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function hasReminderNotification(input: {
  userId: string;
  bookingId: string;
  reminderStage: "24h" | "1h";
}) {
  if (!isDatabaseConnected()) {
    return fallbackNotifications.some(
      (notification) =>
        notification.userId === input.userId &&
        notification.type === "reminder" &&
        notification.metadata?.bookingId === input.bookingId &&
        notification.metadata?.reminderStage === input.reminderStage,
    );
  }

  const existingNotification = await Notification.findOne({
    userAppId: input.userId,
    type: "reminder",
    "metadata.bookingId": input.bookingId,
    "metadata.reminderStage": input.reminderStage,
  })
    .select({ appId: 1 })
    .lean();

  return Boolean(existingNotification);
}

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
}) {
  if (!isDatabaseConnected()) {
    const timestamp = createTimestamp();
    const notification: NotificationRecord = {
      id: randomUUID(),
      userId: input.userId,
      title: input.title.trim(),
      message: input.message.trim(),
      type: input.type,
      metadata: input.metadata,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    fallbackNotifications.push(notification);

    return mapNotificationRecord(notification);
  }

  const notification = await Notification.create({
    appId: randomUUID(),
    userAppId: input.userId,
    title: input.title.trim(),
    message: input.message.trim(),
    type: input.type,
    metadata: input.metadata,
  });

  return mapDbNotification(notification.toObject() as unknown as DbNotification);
}

export async function listNotificationsForUser(
  userId: string,
  options?: { limit?: number },
) {
  const limit = options?.limit && options.limit > 0 ? options.limit : undefined;

  if (!isDatabaseConnected()) {
    const scoped = fallbackNotifications
      .filter((notification) => notification.userId === userId)
      .map(mapNotificationRecord);
    const sorted = sortNotifications(scoped);

    return {
      items: typeof limit === "number" ? sorted.slice(0, limit) : sorted,
      unreadCount: sorted.filter((notification) => !notification.readAt).length,
    } satisfies NotificationsFeed;
  }

  const [rawItems, unreadCount] = await Promise.all([
    Notification.find({ userAppId: userId })
      .sort({ createdAt: -1 })
      .limit(limit ?? 0)
      .lean(),
    Notification.countDocuments({
      userAppId: userId,
      readAt: { $exists: false },
    }),
  ]);

  return {
    items: (rawItems as unknown as DbNotification[]).map(mapDbNotification),
    unreadCount,
  } satisfies NotificationsFeed;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  if (!isDatabaseConnected()) {
    const notification = fallbackNotifications.find(
      (item) => item.id === notificationId,
    );

    if (!notification || notification.userId !== userId) {
      throw new HttpError(404, "Notification could not be found.");
    }

    if (!notification.readAt) {
      notification.readAt = createTimestamp();
      notification.updatedAt = notification.readAt;
    }

    return mapNotificationRecord(notification);
  }

  const notification = await Notification.findOne({
    appId: notificationId,
    userAppId: userId,
  });

  if (!notification) {
    throw new HttpError(404, "Notification could not be found.");
  }

  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }

  return mapDbNotification(notification.toObject() as unknown as DbNotification);
}

export async function markAllNotificationsRead(userId: string) {
  if (!isDatabaseConnected()) {
    let updatedCount = 0;
    const timestamp = createTimestamp();

    for (const notification of fallbackNotifications) {
      if (notification.userId !== userId || notification.readAt) {
        continue;
      }

      notification.readAt = timestamp;
      notification.updatedAt = timestamp;
      updatedCount += 1;
    }

    return { updatedCount };
  }

  const result = await Notification.updateMany(
    {
      userAppId: userId,
      readAt: { $exists: false },
    },
    {
      $set: {
        readAt: new Date(),
      },
    },
  );

  return {
    updatedCount: result.modifiedCount,
  };
}
