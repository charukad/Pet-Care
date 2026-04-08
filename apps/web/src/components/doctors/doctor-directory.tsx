"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Search, Star, Video } from "lucide-react";
import type { DoctorProfile } from "@/data/mock-doctors";

type DoctorDirectoryProps = {
  doctors: DoctorProfile[];
};

const modeOptions = ["All", "Clinic", "Video"] as const;

export function DoctorDirectory({ doctors }: DoctorDirectoryProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<(typeof modeOptions)[number]>("All");

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesQuery =
        doctor.name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(query.toLowerCase()) ||
        doctor.location.toLowerCase().includes(query.toLowerCase());
      const matchesMode =
        mode === "All" || doctor.consultationModes.includes(mode);

      return matchesQuery && matchesMode;
    });
  }, [doctors, mode, query]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-[2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface-strong)] p-5 shadow-[0_24px_80px_rgba(8,47,73,0.08)] md:grid-cols-[1.5fr_auto] md:items-center md:p-6">
        <label className="flex items-center gap-3 rounded-full border border-white/70 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(8,47,73,0.08)]">
          <Search className="h-4 w-4 text-[color:var(--pc-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by doctor, specialization, or location"
            className="w-full bg-transparent text-sm text-[color:var(--pc-ink)] outline-none placeholder:text-[color:var(--pc-muted)]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {modeOptions.map((option) => {
            const isActive = option === mode;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[color:var(--pc-ink)] text-white"
                    : "border border-[color:var(--pc-line)] bg-white text-[color:var(--pc-ink)] hover:border-[color:var(--pc-sky)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {filteredDoctors.map((doctor) => (
          <article
            key={doctor.id}
            className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,var(--pc-emerald),var(--pc-sky))] [font-family:var(--font-display)] text-lg text-white shadow-[0_18px_35px_rgba(16,185,129,0.28)]">
                  {doctor.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="space-y-2">
                  <div>
                    <h2 className="text-2xl font-semibold text-[color:var(--pc-ink)]">
                      {doctor.name}
                    </h2>
                    <p className="text-sm font-medium text-[color:var(--pc-emerald)]">
                      {doctor.specialization}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--pc-muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-[color:var(--pc-gold)]" />
                      {doctor.rating} ({doctor.reviewCount} reviews)
                    </span>
                    <span>{doctor.experienceYears} years experience</span>
                  </div>
                  <p className="max-w-xl text-sm leading-7 text-[color:var(--pc-muted)]">
                    {doctor.bio}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-muted)]">
                Next slot
                <p className="mt-1 font-semibold text-[color:var(--pc-ink)]">
                  {doctor.nextAvailable}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[color:var(--pc-muted)]">
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pc-surface)] px-3 py-2">
                <MapPin className="h-4 w-4" />
                {doctor.location}
              </span>
              {doctor.consultationModes.map((consultationMode) => (
                <span
                  key={consultationMode}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pc-surface)] px-3 py-2"
                >
                  <Video className="h-4 w-4" />
                  {consultationMode}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/doctors/${doctor.slug}`}
                className="rounded-full bg-[color:var(--pc-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                View profile
              </Link>
              <Link
                href={`/booking?doctor=${doctor.id}`}
                className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
              >
                Book appointment
              </Link>
            </div>
          </article>
        ))}
      </section>

      {filteredDoctors.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-[color:var(--pc-line)] bg-white/70 px-6 py-10 text-center text-sm leading-7 text-[color:var(--pc-muted)]">
          No doctors matched that search yet. Try a different specialization, name, or location.
        </section>
      ) : null}
    </div>
  );
}
