"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Camera, Mic, ShieldCheck } from "lucide-react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { ConsultationAccessView } from "@/types/app";

type ConsultationRoomProps = {
  bookingId: string;
};

export function ConsultationRoom({ bookingId }: ConsultationRoomProps) {
  const { isAuthenticated, isLoading, session, user } = useAuth();
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
          getApiErrorMessage(error, "Unable to load the consultation room."),
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
            Opening the consultation room.
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
            Sign in to join the consultation room.
          </h1>
        </section>
      </main>
    );
  }

  if (!access || !access.canJoin) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            The room is not available yet.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            {errorMessage ?? access?.message ?? "Consultation access is currently unavailable."}
          </p>
          <Link
            href={`/consultations/${bookingId}`}
            className="mt-8 inline-flex rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Back to access page
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-[linear-gradient(135deg,rgba(8,47,73,0.98),rgba(14,116,144,0.98))] p-8 text-white shadow-[0_24px_80px_rgba(8,47,73,0.22)]">
        <p className="text-xs font-semibold tracking-[0.24em] uppercase text-white/70">
          Consultation room
        </p>
        <h1 className="mt-4 [font-family:var(--font-display)] text-4xl sm:text-5xl">
          {access.booking.petName} with {user?.role === "doctor" ? access.booking.ownerName : access.booking.doctorName}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
          This is the protected in-app room entry for the active video consultation. The session stays available until the appointment window expires.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.2rem] bg-[color:var(--pc-surface)] p-4">
              <Camera className="h-5 w-5 text-[color:var(--pc-emerald)]" />
              <p className="mt-3 font-semibold text-[color:var(--pc-ink)]">Camera</p>
              <p className="mt-1 text-sm text-[color:var(--pc-muted)]">Ready</p>
            </div>
            <div className="rounded-[1.2rem] bg-[color:var(--pc-surface)] p-4">
              <Mic className="h-5 w-5 text-[color:var(--pc-emerald)]" />
              <p className="mt-3 font-semibold text-[color:var(--pc-ink)]">Microphone</p>
              <p className="mt-1 text-sm text-[color:var(--pc-muted)]">Ready</p>
            </div>
            <div className="rounded-[1.2rem] bg-[color:var(--pc-surface)] p-4">
              <ShieldCheck className="h-5 w-5 text-[color:var(--pc-emerald)]" />
              <p className="mt-3 font-semibold text-[color:var(--pc-ink)]">Room security</p>
              <p className="mt-1 text-sm text-[color:var(--pc-muted)]">{access.roomCode}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-6 py-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
              Live room preview
            </p>
            <div className="mt-4 rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(8,47,73,0.9),rgba(15,23,42,0.92))] px-6 py-16 text-white">
              <p className="text-xl font-semibold">Pet Care Live</p>
              <p className="mt-2 text-sm text-white/70">
                Room {access.roomCode} is active for this consultation window.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
            Session summary
          </h2>
          <div className="mt-6 space-y-3 text-sm text-[color:var(--pc-muted)]">
            <p>
              <strong className="text-[color:var(--pc-ink)]">Role:</strong> {access.actorRole}
            </p>
            <p>
              <strong className="text-[color:var(--pc-ink)]">Doctor:</strong> {access.booking.doctorName}
            </p>
            <p>
              <strong className="text-[color:var(--pc-ink)]">Pet owner:</strong> {access.booking.ownerName}
            </p>
            <p>
              <strong className="text-[color:var(--pc-ink)]">Pet:</strong> {access.booking.petName}
            </p>
          </div>
          <Link
            href={`/consultations/${bookingId}`}
            className="mt-8 inline-flex rounded-full border border-[color:var(--pc-line)] px-5 py-3 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
          >
            Back to access page
          </Link>
        </article>
      </section>
    </main>
  );
}
