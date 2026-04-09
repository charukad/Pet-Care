"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Languages, MapPin, Star } from "lucide-react";
import { api, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import type { PublicDoctorProfileDetail } from "@/types/app";

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
  }).format(new Date(isoString));
}

type DoctorProfileWorkspaceProps = {
  slug: string;
};

export function DoctorProfileWorkspace({
  slug,
}: DoctorProfileWorkspaceProps) {
  const [doctor, setDoctor] = useState<PublicDoctorProfileDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedDoctor, setHasLoadedDoctor] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void api
      .get<ApiResponse<PublicDoctorProfileDetail>>(`/public/doctors/${slug}`)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setDoctor(response.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load this doctor profile."),
        );
      })
      .finally(() => {
        if (isMounted) {
          setHasLoadedDoctor(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (!hasLoadedDoctor) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/doctors"
          className="text-sm font-medium text-[color:var(--pc-muted)] transition hover:text-[color:var(--pc-ink)]"
        >
          Back to doctor directory
        </Link>
        <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Loading doctor profile.
          </p>
        </section>
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/doctors"
          className="text-sm font-medium text-[color:var(--pc-muted)] transition hover:text-[color:var(--pc-ink)]"
        >
          Back to doctor directory
        </Link>
        <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            Doctor profile unavailable
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            {errorMessage ?? "This doctor could not be found right now."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <Link
        href="/doctors"
        className="text-sm font-medium text-[color:var(--pc-muted)] transition hover:text-[color:var(--pc-ink)]"
      >
        Back to doctor directory
      </Link>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2.5rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,var(--pc-emerald),var(--pc-sky))] [font-family:var(--font-display)] text-2xl text-white shadow-[0_20px_40px_rgba(16,185,129,0.28)]">
                {doctor.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
                    Doctor profile
                  </p>
                  <h1 className="mt-2 [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
                    {doctor.name}
                  </h1>
                  <p className="mt-2 text-lg font-medium text-[color:var(--pc-emerald)]">
                    {doctor.specialization}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-[color:var(--pc-muted)]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pc-surface)] px-3 py-2">
                    <Star className="h-4 w-4 fill-current text-[color:var(--pc-gold)]" />
                    {doctor.rating} from {doctor.reviewCount} reviews
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pc-surface)] px-3 py-2">
                    <Clock3 className="h-4 w-4" />
                    {doctor.experienceYears} years experience
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/booking?doctor=${doctor.id}`}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Book this doctor
            </Link>
          </div>

          <p className="mt-8 max-w-3xl text-base leading-8 text-[color:var(--pc-muted)]">
            {doctor.bio}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-[color:var(--pc-surface)] p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--pc-ink)]">
                <MapPin className="h-4 w-4 text-[color:var(--pc-emerald)]" />
                Location
              </div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                {doctor.clinic}
                <br />
                {doctor.location}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[color:var(--pc-surface)] p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--pc-ink)]">
                <CalendarDays className="h-4 w-4 text-[color:var(--pc-emerald)]" />
                Next availability
              </div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                {doctor.nextAvailable}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[color:var(--pc-surface)] p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--pc-ink)]">
                <Languages className="h-4 w-4 text-[color:var(--pc-emerald)]" />
                Languages
              </div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                {doctor.languages.join(", ")}
              </p>
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface-strong)] p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--pc-muted)] uppercase">
              Consultation modes
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.consultationModes.map((mode) => (
                <span
                  key={mode}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)]"
                >
                  {mode}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--pc-muted)] uppercase">
              Focus areas
            </p>
            <div className="mt-4 space-y-3">
              {doctor.focusAreas.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm leading-7 text-[color:var(--pc-muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--pc-muted)] uppercase">
              Recent reviews
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--pc-ink)]">
              What pet owners are saying
            </h2>
          </div>
          <p className="text-sm text-[color:var(--pc-muted)]">
            Latest verified reviews from completed consultations.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {doctor.reviews.length > 0 ? (
            doctor.reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[1.5rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[color:var(--pc-ink)]">
                      {review.reviewerName}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-[color:var(--pc-ink)]">
                    <Star className="h-4 w-4 fill-current text-[color:var(--pc-gold)]" />
                    {review.rating}/5
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-[color:var(--pc-muted)]">
                  {review.comment ?? "This pet owner left a rating without written notes."}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-5 py-8 text-sm leading-7 text-[color:var(--pc-muted)]">
              No public reviews have been posted for this doctor yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
