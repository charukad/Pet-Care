"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { AdminOverview } from "@/types/app";

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

export function AdminDashboard() {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedDashboard, setHasLoadedDashboard] = useState(false);
  const shouldLoadDashboard = Boolean(session?.token && user?.role === "admin");

  useEffect(() => {
    if (!session?.token || user?.role !== "admin") {
      return;
    }

    let isMounted = true;

    void api
      .get<ApiResponse<AdminOverview>>("/admin/overview", {
        headers: createAuthHeaders(session.token),
      })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setOverview(response.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load the admin overview."),
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
            Loading platform overview.
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
            Sign in as admin to view the platform.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            Use `admin@petcare.local` with password `Admin@123` to test the current admin flow.
          </p>
          <Link
            href="/auth/login?next=/dashboard/admin"
            className="mt-8 inline-flex rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Sign in as admin
          </Link>
        </section>
      </main>
    );
  }

  if (user?.role !== "admin") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            This dashboard is only for admin users.
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Admin dashboard
        </p>
        <h1 className="max-w-3xl [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)] sm:text-5xl">
          Monitor the current platform state from one control surface.
        </h1>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {overview ? (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
              <p className="text-sm text-[color:var(--pc-muted)]">Users</p>
              <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
                {overview.counts.users}
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
              <p className="text-sm text-[color:var(--pc-muted)]">Doctors</p>
              <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
                {overview.counts.doctors}
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
              <p className="text-sm text-[color:var(--pc-muted)]">Pets</p>
              <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
                {overview.counts.pets}
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
              <p className="text-sm text-[color:var(--pc-muted)]">Bookings</p>
              <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
                {overview.counts.bookings}
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
              <p className="text-sm text-[color:var(--pc-muted)]">Pending</p>
              <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
                {overview.counts.pendingBookings}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">Recent bookings</h2>
            <div className="mt-6 space-y-4">
              {overview.recentBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[1.35rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-[color:var(--pc-ink)]">
                        {booking.owner.name} with {booking.doctor.name}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                        {booking.pet.name} · {booking.consultationMode} · {formatDateTime(booking.scheduledAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                      {booking.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
