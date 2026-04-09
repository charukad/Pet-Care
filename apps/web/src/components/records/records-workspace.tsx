"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { MedicalHistoryPet } from "@/types/app";

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

export function RecordsWorkspace() {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const [records, setRecords] = useState<MedicalHistoryPet[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedRecords, setHasLoadedRecords] = useState(false);
  const shouldLoadRecords = Boolean(session?.token && user?.role === "user");

  useEffect(() => {
    if (!session?.token || user?.role !== "user") {
      return;
    }

    let isMounted = true;

    void api
      .get<ApiResponse<MedicalHistoryPet[]>>("/medical-history/me", {
        headers: createAuthHeaders(session.token),
      })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setRecords(response.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load medical history right now."),
        );
      })
      .finally(() => {
        if (isMounted) {
          setHasLoadedRecords(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.token, user?.role]);

  if (isLoading || (shouldLoadRecords && !hasLoadedRecords)) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Loading prescriptions and medical history.
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
            Sign in to view pet records.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            Prescriptions and care history are available to pet owner accounts after consultations start generating records.
          </p>
          <Link
            href="/auth/login?next=/records"
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
            Records are available from the pet owner view.
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Medical history
        </p>
        <h1 className="max-w-4xl [font-family:var(--font-display)] text-4xl leading-tight text-[color:var(--pc-ink)] sm:text-5xl">
          Prescriptions, appointments, and follow-up instructions for every pet.
        </h1>
        <p className="max-w-3xl text-base leading-8 text-[color:var(--pc-muted)] sm:text-lg">
          This page turns completed care into a usable record. Each pet now has a single place for appointment history and prescriptions.
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="space-y-6">
        {records.length > 0 ? (
          records.map((record) => (
            <article
              key={record.pet.id}
              className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[color:var(--pc-ink)]">
                    {record.pet.name}
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                    {record.pet.type}
                    {record.pet.breed ? ` · ${record.pet.breed}` : ""}
                    {typeof record.pet.age === "number" ? ` · ${record.pet.age} years` : ""}
                    {` · ${record.pet.sex}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                  <span className="rounded-full bg-[color:var(--pc-surface)] px-3 py-2">
                    {record.bookings.length} booking{record.bookings.length === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-[color:var(--pc-surface)] px-3 py-2">
                    {record.prescriptions.length} prescription{record.prescriptions.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <section>
                  <h3 className="text-lg font-semibold text-[color:var(--pc-ink)]">
                    Appointment history
                  </h3>
                  <div className="mt-4 space-y-3">
                    {record.bookings.length > 0 ? (
                      record.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-[1.35rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
                        >
                          <p className="font-semibold text-[color:var(--pc-ink)]">
                            {booking.doctor.name}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                            {booking.doctor.specialization} · {booking.consultationMode}
                          </p>
                          <p className="mt-2 text-sm text-[color:var(--pc-muted)]">
                            {formatDateTime(booking.scheduledAt)}
                          </p>
                          {booking.notes ? (
                            <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                              {booking.notes}
                            </p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.35rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm text-[color:var(--pc-muted)]">
                        No booking history yet.
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-[color:var(--pc-ink)]">
                    Prescriptions
                  </h3>
                  <div className="mt-4 space-y-4">
                    {record.prescriptions.length > 0 ? (
                      record.prescriptions.map((prescription) => (
                        <article
                          key={prescription.id}
                          className="rounded-[1.35rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-[color:var(--pc-ink)]">
                                {prescription.diagnosis}
                              </p>
                              <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                                Issued by {prescription.doctor.name}
                              </p>
                            </div>
                            <span className="text-xs text-[color:var(--pc-muted)]">
                              {formatDateTime(prescription.issuedAt)}
                            </span>
                          </div>

                          {prescription.notes ? (
                            <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
                              {prescription.notes}
                            </p>
                          ) : null}

                          <div className="mt-4 space-y-3">
                            {prescription.medicines.map((medicine) => (
                              <div
                                key={`${prescription.id}-${medicine.name}`}
                                className="rounded-[1rem] bg-white px-4 py-3 text-sm text-[color:var(--pc-muted)]"
                              >
                                <p className="font-semibold text-[color:var(--pc-ink)]">
                                  {medicine.name}
                                </p>
                                <p className="mt-1">
                                  {[medicine.dosage, medicine.frequency, medicine.duration]
                                    .filter(Boolean)
                                    .join(" · ") || "No dosage details added"}
                                </p>
                                {medicine.instructions ? (
                                  <p className="mt-2 leading-7">{medicine.instructions}</p>
                                ) : null}
                              </div>
                            ))}
                          </div>

                          {prescription.followUp ? (
                            <div className="mt-4 rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-muted)]">
                              <strong className="text-[color:var(--pc-ink)]">Follow-up:</strong>{" "}
                              {prescription.followUp}
                            </div>
                          ) : null}
                        </article>
                      ))
                    ) : (
                      <div className="rounded-[1.35rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm text-[color:var(--pc-muted)]">
                        No prescriptions have been issued for this pet yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </article>
          ))
        ) : (
          <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <h2 className="text-2xl font-semibold text-[color:var(--pc-ink)]">
              No records available yet.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--pc-muted)]">
              Once bookings and prescriptions start coming in, this page will become your full medical history timeline.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
