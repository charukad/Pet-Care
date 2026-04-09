"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Video, VideoOff } from "lucide-react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { ConsultationAccessView } from "@/types/app";

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

type ConsultationWorkspaceProps = {
  bookingId: string;
};

function getStateBadge(state: ConsultationAccessView["state"]) {
  if (state === "ready") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (state === "scheduled") {
    return "bg-sky-100 text-sky-700";
  }

  if (state === "awaiting_confirmation") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-700";
}

export function ConsultationWorkspace({
  bookingId,
}: ConsultationWorkspaceProps) {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const userRole = user?.role;
  const [access, setAccess] = useState<ConsultationAccessView | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const shouldLoad = Boolean(session?.token && user && user.role !== "admin");

  useEffect(() => {
    if (!session?.token || !user || user.role === "admin") {
      return;
    }

    let isMounted = true;

    void api
      .get<ApiResponse<ConsultationAccessView>>(
        `/consultations/${bookingId}/access`,
        {
          headers: createAuthHeaders(session.token),
        },
      )
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setAccess(response.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load this consultation."),
        );
      })
      .finally(() => {
        if (isMounted) {
          setHasLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId, session?.token, user]);

  if (isLoading || (shouldLoad && !hasLoaded)) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Preparing consultation access details.
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
            Sign in to open the consultation workspace.
          </h1>
          <Link
            href={`/auth/login?next=/consultations/${bookingId}`}
            className="mt-8 inline-flex rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  if (user?.role === "admin") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            Consultations are private to doctors and pet owners.
          </h1>
        </section>
      </main>
    );
  }

  if (!access) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          {errorMessage ?? "Consultation access could not be loaded."}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Remote consultation
        </p>
        <h1 className="max-w-3xl [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)] sm:text-5xl">
          {access.booking.petName} with {userRole === "doctor" ? access.booking.ownerName : access.booking.doctorName}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-[color:var(--pc-muted)] sm:text-lg">
          {access.message}
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
                Access status
              </h2>
              <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                Booking time: {formatDateTime(access.booking.scheduledAt)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStateBadge(access.state)}`}
            >
              {access.state.replaceAll("_", " ")}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.2rem] bg-[color:var(--pc-surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                Provider
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--pc-ink)]">
                {access.provider}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-[color:var(--pc-surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                Room code
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--pc-ink)]">
                {access.roomCode ?? "Not available"}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-[color:var(--pc-surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                Opens at
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--pc-ink)]">
                {access.opensAt ? formatDateTime(access.opensAt) : "Not applicable"}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-[color:var(--pc-surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                Expires at
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--pc-ink)]">
                {access.expiresAt ? formatDateTime(access.expiresAt) : "Not applicable"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {access.canJoin && access.roomUrl ? (
              <Link
                href={access.roomUrl}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Video className="h-4 w-4" />
                Join consultation room
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--pc-line)] px-5 py-3 text-sm font-medium text-[color:var(--pc-muted)]">
                <VideoOff className="h-4 w-4" />
                Room not joinable yet
              </span>
            )}
            <Link
              href={userRole === "doctor" ? "/dashboard/doctor" : "/dashboard/user"}
              className="rounded-full border border-[color:var(--pc-line)] px-5 py-3 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
            >
              Back to dashboard
            </Link>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
            Consultation notes
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[color:var(--pc-muted)]">
            <p>
              Join access is only available for accepted video bookings, and the room opens 15 minutes before the scheduled time.
            </p>
            <p>
              If a pet owner reschedules an accepted booking, the doctor has to confirm it again before the room unlocks.
            </p>
            <p>
              Cancelled, rejected, clinic-only, and expired bookings stay visible here with a clear explanation instead of a broken join button.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
