"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { Booking } from "@/types/app";

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

export function DoctorDashboard() {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedDashboard, setHasLoadedDashboard] = useState(false);
  const [isMutating, startTransition] = useTransition();
  const shouldLoadDashboard = Boolean(session?.token && user?.role === "doctor");

  useEffect(() => {
    if (!session?.token || user?.role !== "doctor") {
      return;
    }

    let isMounted = true;

    void api
      .get<ApiResponse<Booking[]>>("/bookings/doctor/me", {
        headers: createAuthHeaders(session.token),
      })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setBookings(response.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load doctor bookings."),
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

  function updateStatus(bookingId: string, status: "accepted" | "rejected" | "completed") {
    if (!session?.token) {
      return;
    }

    const rejectionReason =
      status === "rejected"
        ? window.prompt("Why are you rejecting this booking?") ?? ""
        : "";

    startTransition(() => {
      void (async () => {
        try {
          const response = await api.patch<ApiResponse<Booking>>(
            `/bookings/${bookingId}/status`,
            {
              status,
              rejectionReason,
            },
            {
              headers: createAuthHeaders(session.token),
            },
          );

          setBookings((currentBookings) =>
            currentBookings.map((booking) =>
              booking.id === bookingId ? response.data.data : booking,
            ),
          );
        } catch (error) {
          setErrorMessage(
            getApiErrorMessage(error, "Unable to update that booking."),
          );
        }
      })();
    });
  }

  if (isLoading || (shouldLoadDashboard && !hasLoadedDashboard)) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Loading your doctor workspace.
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
            Sign in as a doctor to manage bookings.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            The seeded doctor account `amara@petcare.local` with password `Doctor@123` can be used to test this flow.
          </p>
          <Link
            href="/auth/login?next=/dashboard/doctor"
            className="mt-8 inline-flex rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Sign in as doctor
          </Link>
        </section>
      </main>
    );
  }

  if (user?.role !== "doctor") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            This dashboard is only for doctors.
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Doctor dashboard
        </p>
        <h1 className="max-w-3xl [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)] sm:text-5xl">
          Manage incoming bookings and patient status.
        </h1>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Total bookings</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">{bookings.length}</p>
        </div>
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Pending</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {bookings.filter((booking) => booking.status === "pending").length}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Accepted</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {bookings.filter((booking) => booking.status === "accepted").length}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
                    {booking.owner.name} · {booking.pet.name}
                  </h2>
                  <p className="mt-2 text-sm text-[color:var(--pc-muted)]">
                    {booking.pet.type}
                    {booking.pet.breed ? ` · ${booking.pet.breed}` : ""} · {booking.consultationMode}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--pc-muted)]">
                    {formatDateTime(booking.scheduledAt)}
                  </p>
                  {booking.notes ? (
                    <p className="mt-4 text-sm leading-7 text-[color:var(--pc-muted)]">
                      {booking.notes}
                    </p>
                  ) : null}
                  {booking.rejectionReason ? (
                    <p className="mt-3 text-sm text-rose-700">
                      Rejection reason: {booking.rejectionReason}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-[color:var(--pc-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                    {booking.status}
                  </span>
                  {booking.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => updateStatus(booking.id, "accepted")}
                        disabled={isMutating}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(booking.id, "rejected")}
                        disabled={isMutating}
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70"
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                  {booking.status === "accepted" ? (
                    <button
                      type="button"
                      onClick={() => updateStatus(booking.id, "completed")}
                      disabled={isMutating}
                      className="rounded-full bg-[color:var(--pc-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70"
                    >
                      Mark completed
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[color:var(--pc-line)] bg-white/90 px-6 py-10 text-sm text-[color:var(--pc-muted)]">
            No bookings assigned yet.
          </div>
        )}
      </section>
    </main>
  );
}
