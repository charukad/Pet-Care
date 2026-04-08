import type { Metadata } from "next";
import { UserDashboard } from "@/components/dashboard/user-dashboard";

export const metadata: Metadata = {
  title: "User Dashboard | Pet Care",
};

export default function UserDashboardPage() {
  return <UserDashboard />;
}
