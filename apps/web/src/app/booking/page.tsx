import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWorkspace } from "@/components/booking/booking-workspace";

export const metadata: Metadata = {
  title: "Booking | Pet Care",
};

export default function BookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingWorkspace />
    </Suspense>
  );
}
