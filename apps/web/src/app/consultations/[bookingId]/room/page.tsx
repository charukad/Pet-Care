import type { Metadata } from "next";
import { ConsultationRoom } from "@/components/consultations/consultation-room";

export const metadata: Metadata = {
  title: "Consultation Room | Pet Care",
  description: "Protected in-app room for active remote consultations.",
};

export default async function ConsultationRoomPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return <ConsultationRoom bookingId={bookingId} />;
}
