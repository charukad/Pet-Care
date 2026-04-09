"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookingStatusTimeline } from "@/components/booking/booking-status-timeline";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { Booking, Pet, Prescription } from "@/types/app";

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

export function UserDashboard() {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedDashboard, setHasLoadedDashboard] = useState(false);
  const shouldLoadDashboard = Boolean(session?.token && user?.role === "user");

  useEffect(() => {
    if (!session?.token || user?.role !== "user") {
      return;
    }

    let isMounted = true;

    void Promise.all([
      api.get<ApiResponse<Pet[]>>("/pets", {
        headers: createAuthHeaders(session.token),
      }),
      api.get<ApiResponse<Booking[]>>("/bookings/me", {
        headers: createAuthHeaders(session.token),
      }),
      api.get<ApiResponse<Prescription[]>>("/prescriptions/me", {
        headers: createAuthHeaders(session.token),
      }),
    ])
      .then(([petsResponse, bookingsResponse, prescriptionsResponse]) => {
        if (!isMounted) {
          return;
        }

        setPets(petsResponse.data.data);
        setBookings(bookingsResponse.data.data);
        setPrescriptions(prescriptionsResponse.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load your dashboard right now."),
        );
      })
      .finally(() => {
        if (isMounted) {
          setHasLoadedDashboard(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.token, user?.role]);

  if (isLoading || (shouldLoadDashboard && !hasLoadedDashboard)) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Loading your pet owner dashboard.
          </p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            Sign in to open your dashboard.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            Your pet owner dashboard shows bookings, pets, prescriptions, and quick access to your records.
          </p>
          <Link
            href="/auth/login?next=/dashboard/user"
            className="mt-8 inline-flex rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  if (user?.role !== "user") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            This dashboard is only for pet owners.
          </h1>
        </section>
      </main>
    );
  }

  const recentPrescriptions = prescriptions.slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          User dashboard
        </p>
        <h1 className="max-w-3xl [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)] sm:text-5xl">
          Welcome back, {user.name}.
        </h1>
        <p className="max-w-2xl text-base leading-8 text-[color:var(--pc-muted)]">
          Your booking, prescription, and medical-record flow now lives in one place.
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Pets</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">{pets.length}</p>
        </div>
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Bookings</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {bookings.length}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Pending</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {bookings.filter((booking) => booking.status === "pending").length}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Prescriptions</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {prescriptions.length}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">Pets</h2>
              <p className="text-sm text-[color:var(--pc-muted)]">
                Your saved profiles for future bookings.
              </p>
            </div>
            <Link
              href="/booking"
              className="rounded-full bg-[color:var(--pc-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Add pet or book
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {pets.length > 0 ? (
              pets.map((pet) => (
                <div
                  key={pet.id}
                  className="rounded-[1.35rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-4 text-sm text-[color:var(--pc-muted)]"
                >
                  <p className="font-semibold text-[color:var(--pc-ink)]">{pet.name}</p>
                  <p className="mt-1">
                    {pet.type}
                    {pet.breed ? ` · ${pet.breed}` : ""}
                    {typeof pet.age === "number" ? ` · ${pet.age} years` : ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm text-[color:var(--pc-muted)]">
                No pet profiles yet.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
                Recent prescriptions
              </h2>
              <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                New treatment notes and follow-up guidance appear here first.
              </p>
            </div>
            <Link
              href="/records"
              className="rounded-full bg-[color:var(--pc-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Open records
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {recentPrescriptions.length > 0 ? (
              recentPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="rounded-[1.35rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-[color:var(--pc-ink)]">
                        {prescription.diagnosis}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                        {prescription.pet.name} · {prescription.doctor.name}
                      </p>
                    </div>
                    <span className="text-sm text-[color:var(--pc-muted)]">
                      {formatDateTime(prescription.issuedAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[color:var(--pc-muted)]">
                    {prescription.medicines.length} medicine
                    {prescription.medicines.length === 1 ? "" : "s"}
                    {prescription.followUp ? ` · Follow-up: ${prescription.followUp}` : ""}
                  </p>
                  {prescription.notes ? (
                    <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                      {prescription.notes}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm text-[color:var(--pc-muted)]">
                No prescriptions yet. They will appear here after a doctor completes treatment notes.
              </div>
            )}
          </div>
        </article>
      </section>

      <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
        <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">Bookings</h2>
        <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
          Track doctor responses and appointment timing here.
        </p>
        <div className="mt-6 space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-[1.35rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[color:var(--pc-ink)]">
                      {booking.doctor.name}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                      {booking.pet.name} · {booking.consultationMode}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                    {booking.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[color:var(--pc-muted)]">
                  {formatDateTime(booking.scheduledAt)}
                </p>
                {booking.notes ? (
                  <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                    {booking.notes}
                  </p>
                ) : null}
                <BookingStatusTimeline history={booking.statusHistory} />
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm text-[color:var(--pc-muted)]">
              No bookings yet.
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
