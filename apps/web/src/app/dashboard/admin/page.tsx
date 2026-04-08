import type { Metadata } from "next";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Pet Care",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
