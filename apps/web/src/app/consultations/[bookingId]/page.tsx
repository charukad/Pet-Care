import type { Metadata } from "next";
import { ConsultationWorkspace } from "@/components/consultations/consultation-workspace";

export const metadata: Metadata = {
  title: "Consultation | Pet Care",
  description: "Protected remote consultation access for video appointments.",
};

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return <ConsultationWorkspace bookingId={bookingId} />;
}
