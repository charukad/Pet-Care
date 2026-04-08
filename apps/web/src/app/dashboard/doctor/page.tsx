import type { Metadata } from "next";
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard";

export const metadata: Metadata = {
  title: "Doctor Dashboard | Pet Care",
};

export default function DoctorDashboardPage() {
  return <DoctorDashboard />;
}
