import type { Metadata } from "next";
import { NotificationsWorkspace } from "@/components/notifications/notifications-workspace";

export const metadata: Metadata = {
  title: "Notifications | Pet Care",
  description: "In-app booking and prescription notifications.",
};

export default function NotificationsPage() {
  return <NotificationsWorkspace />;
}
