import type { Metadata } from "next";
import { RecordsWorkspace } from "@/components/records/records-workspace";

export const metadata: Metadata = {
  title: "Records | Pet Care",
  description: "Prescription history and pet medical records.",
};

export default function RecordsPage() {
  return <RecordsWorkspace />;
}
