"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookingStatusTimeline } from "@/components/booking/booking-status-timeline";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { Booking, Prescription } from "@/types/app";

type MedicineDraft = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type PrescriptionDraft = {
  diagnosis: string;
  notes: string;
  followUp: string;
  medicines: MedicineDraft[];
};

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function formatDateInput(isoString: string) {
  return new Intl.DateTimeFormat("en-CA").format(new Date(isoString));
}

function createMedicineDraft(): MedicineDraft {
  return {
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  };
}

function createPrescriptionDraft(): PrescriptionDraft {
  return {
    diagnosis: "",
    notes: "",
    followUp: "",
    medicines: [createMedicineDraft()],
  };
}

export function DoctorDashboard() {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PrescriptionDraft>>({});
  const [openComposerBookingId, setOpenComposerBookingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedDashboard, setHasLoadedDashboard] = useState(false);
  const [isUpdatingBookingId, setIsUpdatingBookingId] = useState<string | null>(null);
  const [isSubmittingBookingId, setIsSubmittingBookingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Booking["status"] | "all">("all");
  const [patientQuery, setPatientQuery] = useState("");
  const [scheduledDateFilter, setScheduledDateFilter] = useState("");
  const shouldLoadDashboard = Boolean(session?.token && user?.role === "doctor");

  useEffect(() => {
    if (!session?.token || user?.role !== "doctor") {
      return;
    }

    let isMounted = true;

    void Promise.all([
      api.get<ApiResponse<Booking[]>>("/bookings/doctor/me", {
        headers: createAuthHeaders(session.token),
      }),
      api.get<ApiResponse<Prescription[]>>("/prescriptions/doctor/me", {
        headers: createAuthHeaders(session.token),
      }),
    ])
      .then(([bookingsResponse, prescriptionsResponse]) => {
        if (!isMounted) {
          return;
        }

        setBookings(bookingsResponse.data.data);
        setPrescriptions(prescriptionsResponse.data.data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getApiErrorMessage(error, "Unable to load doctor bookings."));
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

  async function updateStatus(
    bookingId: string,
    status: "accepted" | "rejected" | "completed",
  ) {
    if (!session?.token) {
      return;
    }

    const rejectionReason =
      status === "rejected"
        ? window.prompt("Why are you rejecting this booking?") ?? ""
        : "";

    setIsUpdatingBookingId(bookingId);

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
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to update that booking."));
    } finally {
      setIsUpdatingBookingId(null);
    }
  }

  function toggleComposer(bookingId: string) {
    setOpenComposerBookingId((currentBookingId) =>
      currentBookingId === bookingId ? null : bookingId,
    );

    setDrafts((currentDrafts) => {
      if (currentDrafts[bookingId]) {
        return currentDrafts;
      }

      return {
        ...currentDrafts,
        [bookingId]: createPrescriptionDraft(),
      };
    });
  }

  function updateDraftField(
    bookingId: string,
    field: "diagnosis" | "notes" | "followUp",
    value: string,
  ) {
    setDrafts((currentDrafts) => {
      const currentDraft = currentDrafts[bookingId] ?? createPrescriptionDraft();

      return {
        ...currentDrafts,
        [bookingId]: {
          ...currentDraft,
          [field]: value,
        },
      };
    });
  }

  function updateMedicineField(
    bookingId: string,
    medicineIndex: number,
    field: keyof MedicineDraft,
    value: string,
  ) {
    setDrafts((currentDrafts) => {
      const currentDraft = currentDrafts[bookingId] ?? createPrescriptionDraft();

      return {
        ...currentDrafts,
        [bookingId]: {
          ...currentDraft,
          medicines: currentDraft.medicines.map((medicine, index) =>
            index === medicineIndex ? { ...medicine, [field]: value } : medicine,
          ),
        },
      };
    });
  }

  function addMedicine(bookingId: string) {
    setDrafts((currentDrafts) => {
      const currentDraft = currentDrafts[bookingId] ?? createPrescriptionDraft();

      return {
        ...currentDrafts,
        [bookingId]: {
          ...currentDraft,
          medicines: [...currentDraft.medicines, createMedicineDraft()],
        },
      };
    });
  }

  function removeMedicine(bookingId: string, medicineIndex: number) {
    setDrafts((currentDrafts) => {
      const currentDraft = currentDrafts[bookingId] ?? createPrescriptionDraft();
      const nextMedicines =
        currentDraft.medicines.length === 1
          ? currentDraft.medicines
          : currentDraft.medicines.filter((_, index) => index !== medicineIndex);

      return {
        ...currentDrafts,
        [bookingId]: {
          ...currentDraft,
          medicines: nextMedicines,
        },
      };
    });
  }

  async function submitPrescription(bookingId: string) {
    if (!session?.token) {
      return;
    }

    const draft = drafts[bookingId] ?? createPrescriptionDraft();
    setIsSubmittingBookingId(bookingId);

    try {
      const response = await api.post<ApiResponse<Prescription>>(
        "/prescriptions",
        {
          bookingId,
          diagnosis: draft.diagnosis,
          notes: draft.notes,
          followUp: draft.followUp,
          medicines: draft.medicines,
        },
        {
          headers: createAuthHeaders(session.token),
        },
      );

      setPrescriptions((currentPrescriptions) => [
        response.data.data,
        ...currentPrescriptions,
      ]);
      setDrafts((currentDrafts) => ({
        ...currentDrafts,
        [bookingId]: createPrescriptionDraft(),
      }));
      setOpenComposerBookingId(null);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to create that prescription."),
      );
    } finally {
      setIsSubmittingBookingId(null);
    }
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

  const normalizedPatientQuery = patientQuery.trim().toLowerCase();
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      statusFilter === "all" ? true : booking.status === statusFilter;
    const matchesPatient =
      normalizedPatientQuery.length === 0
        ? true
        : `${booking.owner.name} ${booking.owner.email} ${booking.pet.name}`
            .toLowerCase()
            .includes(normalizedPatientQuery);
    const matchesDate = scheduledDateFilter
      ? formatDateInput(booking.scheduledAt) === scheduledDateFilter
      : true;

    return matchesStatus && matchesPatient && matchesDate;
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Doctor dashboard
        </p>
        <h1 className="max-w-3xl [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)] sm:text-5xl">
          Manage bookings, complete visits, and issue treatment plans.
        </h1>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
          <p className="text-sm text-[color:var(--pc-muted)]">Completed</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {bookings.filter((booking) => booking.status === "completed").length}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm text-[color:var(--pc-muted)]">Prescriptions issued</p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--pc-ink)]">
            {prescriptions.length}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
              Filter bookings
            </h2>
            <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
              Narrow the list by current status, patient or owner, and appointment date.
            </p>
          </div>
          <p className="text-sm text-[color:var(--pc-muted)]">
            Showing {filteredBookings.length} of {bookings.length} booking
            {bookings.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <label className="block text-sm font-medium text-[color:var(--pc-ink)]">
            Patient or owner
            <input
              value={patientQuery}
              onChange={(event) => setPatientQuery(event.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
              placeholder="Search by pet name, owner, or email"
            />
          </label>

          <label className="block text-sm font-medium text-[color:var(--pc-ink)]">
            Status
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as Booking["status"] | "all")
              }
              className="mt-2 w-full rounded-[1rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-[color:var(--pc-ink)]">
            Appointment date
            <input
              type="date"
              value={scheduledDateFilter}
              onChange={(event) => setScheduledDateFilter(event.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setPatientQuery("");
                setStatusFilter("all");
                setScheduledDateFilter("");
              }}
              className="w-full rounded-full border border-[color:var(--pc-line)] px-4 py-3 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const relatedPrescriptions = prescriptions.filter(
              (prescription) => prescription.booking.id === booking.id,
            );
            const canPrescribe =
              booking.status === "accepted" || booking.status === "completed";
            const draft = drafts[booking.id] ?? createPrescriptionDraft();

            return (
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
                          disabled={isUpdatingBookingId === booking.id}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(booking.id, "rejected")}
                          disabled={isUpdatingBookingId === booking.id}
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
                        disabled={isUpdatingBookingId === booking.id}
                        className="rounded-full bg-[color:var(--pc-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70"
                      >
                        Mark completed
                      </button>
                    ) : null}
                    {canPrescribe ? (
                      <button
                        type="button"
                        onClick={() => toggleComposer(booking.id)}
                        className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white"
                      >
                        {openComposerBookingId === booking.id
                          ? "Close prescription"
                          : "Write prescription"}
                      </button>
                    ) : null}
                  </div>
                </div>

                <BookingStatusTimeline history={booking.statusHistory} />

                <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <section>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[color:var(--pc-ink)]">
                          Prescriptions
                        </h3>
                        <p className="text-sm text-[color:var(--pc-muted)]">
                          Issued treatment plans for this booking.
                        </p>
                      </div>
                      <span className="rounded-full bg-[color:var(--pc-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                        {relatedPrescriptions.length}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {relatedPrescriptions.length > 0 ? (
                        relatedPrescriptions.map((prescription) => (
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
                                  {prescription.medicines.length} medicine
                                  {prescription.medicines.length === 1 ? "" : "s"}
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
                            <div className="mt-4 space-y-2">
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
                              <p className="mt-4 text-sm text-[color:var(--pc-muted)]">
                                Follow-up: {prescription.followUp}
                              </p>
                            ) : null}
                          </article>
                        ))
                      ) : (
                        <div className="rounded-[1.35rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm text-[color:var(--pc-muted)]">
                          No prescriptions have been issued for this booking yet.
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <div>
                      <h3 className="text-lg font-semibold text-[color:var(--pc-ink)]">
                        Treatment composer
                      </h3>
                      <p className="text-sm text-[color:var(--pc-muted)]">
                        {canPrescribe
                          ? "Use structured fields so the pet owner can review dosage and follow-up instructions clearly."
                          : "Prescription entry becomes available after a booking is accepted."}
                      </p>
                    </div>

                    {canPrescribe && openComposerBookingId === booking.id ? (
                      <form
                        className="mt-4 space-y-4 rounded-[1.35rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void submitPrescription(booking.id);
                        }}
                      >
                        <label className="block text-sm font-medium text-[color:var(--pc-ink)]">
                          Diagnosis
                          <input
                            value={draft.diagnosis}
                            onChange={(event) =>
                              updateDraftField(booking.id, "diagnosis", event.target.value)
                            }
                            className="mt-2 w-full rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                            placeholder="Example: Allergic dermatitis"
                          />
                        </label>

                        <label className="block text-sm font-medium text-[color:var(--pc-ink)]">
                          Consultation notes
                          <textarea
                            value={draft.notes}
                            onChange={(event) =>
                              updateDraftField(booking.id, "notes", event.target.value)
                            }
                            rows={4}
                            className="mt-2 w-full rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                            placeholder="Summarize findings, response, and home-care instructions."
                          />
                        </label>

                        <label className="block text-sm font-medium text-[color:var(--pc-ink)]">
                          Follow-up guidance
                          <input
                            value={draft.followUp}
                            onChange={(event) =>
                              updateDraftField(booking.id, "followUp", event.target.value)
                            }
                            className="mt-2 w-full rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                            placeholder="Example: Review after 10 days if itching continues."
                          />
                        </label>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-sm font-semibold text-[color:var(--pc-ink)]">
                              Medicines
                            </h4>
                            <button
                              type="button"
                              onClick={() => addMedicine(booking.id)}
                              className="rounded-full border border-[color:var(--pc-line)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white"
                            >
                              Add medicine
                            </button>
                          </div>

                          {draft.medicines.map((medicine, medicineIndex) => (
                            <div
                              key={`${booking.id}-medicine-${medicineIndex}`}
                              className="space-y-3 rounded-[1rem] border border-[color:var(--pc-line)] bg-white p-4"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-semibold text-[color:var(--pc-ink)]">
                                  Medicine {medicineIndex + 1}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => removeMedicine(booking.id, medicineIndex)}
                                  disabled={draft.medicines.length === 1}
                                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)] transition hover:text-[color:var(--pc-ink)] disabled:opacity-50"
                                >
                                  Remove
                                </button>
                              </div>

                              <input
                                value={medicine.name}
                                onChange={(event) =>
                                  updateMedicineField(
                                    booking.id,
                                    medicineIndex,
                                    "name",
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-[1rem] border border-[color:var(--pc-line)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                                placeholder="Medicine name"
                              />

                              <div className="grid gap-3 sm:grid-cols-3">
                                <input
                                  value={medicine.dosage}
                                  onChange={(event) =>
                                    updateMedicineField(
                                      booking.id,
                                      medicineIndex,
                                      "dosage",
                                      event.target.value,
                                    )
                                  }
                                  className="rounded-[1rem] border border-[color:var(--pc-line)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                                  placeholder="Dosage"
                                />
                                <input
                                  value={medicine.frequency}
                                  onChange={(event) =>
                                    updateMedicineField(
                                      booking.id,
                                      medicineIndex,
                                      "frequency",
                                      event.target.value,
                                    )
                                  }
                                  className="rounded-[1rem] border border-[color:var(--pc-line)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                                  placeholder="Frequency"
                                />
                                <input
                                  value={medicine.duration}
                                  onChange={(event) =>
                                    updateMedicineField(
                                      booking.id,
                                      medicineIndex,
                                      "duration",
                                      event.target.value,
                                    )
                                  }
                                  className="rounded-[1rem] border border-[color:var(--pc-line)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                                  placeholder="Duration"
                                />
                              </div>

                              <textarea
                                value={medicine.instructions}
                                onChange={(event) =>
                                  updateMedicineField(
                                    booking.id,
                                    medicineIndex,
                                    "instructions",
                                    event.target.value,
                                  )
                                }
                                rows={3}
                                className="w-full rounded-[1rem] border border-[color:var(--pc-line)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
                                placeholder="Special instructions for the pet owner."
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={isSubmittingBookingId === booking.id}
                            className="rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70"
                          >
                            {isSubmittingBookingId === booking.id
                              ? "Saving prescription..."
                              : "Save prescription"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenComposerBookingId(null)}
                            className="rounded-full border border-[color:var(--pc-line)] px-5 py-3 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)] hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-4 rounded-[1.35rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-6 text-sm text-[color:var(--pc-muted)]">
                        {canPrescribe
                          ? "Open the prescription composer to add diagnosis, medicines, and follow-up guidance."
                          : "Accept or complete the booking first to start a prescription."}
                      </div>
                    )}
                  </section>
                </div>
              </article>
            );
          })
        ) : bookings.length > 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[color:var(--pc-line)] bg-white/90 px-6 py-10 text-sm text-[color:var(--pc-muted)]">
            No bookings match the current filters.
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[color:var(--pc-line)] bg-white/90 px-6 py-10 text-sm text-[color:var(--pc-muted)]">
            No bookings assigned yet.
          </div>
        )}
      </section>
    </main>
  );
}
