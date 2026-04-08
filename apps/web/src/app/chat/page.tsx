import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Chat | Pet Care",
};

export default function ChatPage() {
  return (
    <PlaceholderPage
      eyebrow="Doctor messaging"
      title="Real-time chat has a backend foundation and a frontend route waiting for the next step."
      description="The API now includes Socket.io setup for conversation rooms and message broadcasting. This screen is the future home of secure user-to-doctor communication tied to bookings."
      highlights={[
        "Socket.io groundwork is already registered on the API server.",
        "Next step: connect authenticated conversations, message persistence, and unread state.",
        "The final chat flow will be restricted to valid doctor-owner relationships.",
        "Mobile and desktop layouts were considered when setting up this route shell.",
      ]}
      primaryAction={{
        href: "/dashboard/user",
        label: "Open the user dashboard",
      }}
    />
  );
}
