import type { Metadata } from "next";
import { DoctorDirectory } from "@/components/doctors/doctor-directory";
import { mockDoctors } from "@/data/mock-doctors";

export const metadata: Metadata = {
  title: "Find a Vet | Pet Care",
  description: "Browse veterinarians by specialization, location, and consultation mode.",
};

export default function DoctorsPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Doctor directory
        </p>
        <h1 className="max-w-4xl [font-family:var(--font-display)] text-4xl leading-tight text-[color:var(--pc-ink)] sm:text-5xl">
          Explore trusted vets by specialization, consultation type, and location.
        </h1>
        <p className="max-w-3xl text-base leading-8 text-[color:var(--pc-muted)] sm:text-lg">
          This public directory is the first production-facing slice of Pet Care. It supports search without login and gives each doctor a profile path for deeper browsing.
        </p>
      </section>

      <DoctorDirectory doctors={mockDoctors} />
    </main>
  );
}
