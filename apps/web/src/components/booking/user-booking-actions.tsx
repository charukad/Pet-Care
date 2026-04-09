"use client";

import { useEffect, useMemo, useState } from "react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import type { Booking, DoctorAvailabilityDateView } from "@/types/app";

function getDateInputValue(isoString: string) {
  return new Intl.DateTimeFormat("en-CA").format(new Date(isoString));
}

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

type UserBookingActionsProps = {
  booking: Booking;
  token: string;
  onUpdated: (booking: Booking) => void;
  onError: (message: string) => void;
};

export function UserBookingActions({
  booking,
  token,
  onUpdated,
  onError,
}: UserBookingActionsProps) {
  const [today] = useState(() => new Date());
  const canManage =
    booking.status === "pending" || booking.status === "accepted";
  const hoursUntilAppointment =
    (new Date(booking.scheduledAt).getTime() - today.getTime()) / (1000 * 60 * 60);
  const canReschedule = canManage && hoursUntilAppointment >= 12;
  const canCancel = canManage && hoursUntilAppointment >= 2;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDateInputValue(booking.scheduledAt));
  const [availabilityData, setAvailabilityData] =
    useState<DoctorAvailabilityDateView | null>(null);
  const [selectedSlotStartsAt, setSelectedSlotStartsAt] = useState(booking.scheduledAt);
  const [cancelReason, setCancelReason] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setSelectedDate(getDateInputValue(booking.scheduledAt));
    setSelectedSlotStartsAt(booking.scheduledAt);
    setIsOpen(false);
    setCancelReason("");
  }, [booking.id, booking.scheduledAt]);

  useEffect(() => {
    if (!isOpen || !canManage) {
      return;
    }

    let isMounted = true;
    setIsLoadingAvailability(true);

    void api
      .get<ApiResponse<DoctorAvailabilityDateView>>(
        `/public/doctors/${booking.doctor.id}/availability`,
        {
          params: { date: selectedDate },
        },
      )
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const nextAvailability = response.data.data;
        setAvailabilityData(nextAvailability);
        setSelectedSlotStartsAt((currentSlot) => {
          if (
            currentSlot &&
            nextAvailability.slots.some(
              (slot) =>
                slot.startsAt === currentSlot &&
                (slot.isAvailable || slot.startsAt === booking.scheduledAt),
            )
          ) {
            return currentSlot;
          }

          return (
            nextAvailability.slots.find((slot) => slot.isAvailable)?.startsAt ?? ""
          );
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setAvailabilityData(null);
        onError(getApiErrorMessage(error, "Unable to load reschedule slots."));
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAvailability(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [booking.doctor.id, booking.scheduledAt, canManage, isOpen, onError, selectedDate]);

  const slotOptions = useMemo(() => {
    return availabilityData?.slots.map((slot) => ({
      ...slot,
      isCurrentBooking: slot.startsAt === booking.scheduledAt,
    })) ?? [];
  }, [availabilityData?.slots, booking.scheduledAt]);

  if (!canManage) {
    return null;
  }

  async function handleReschedule() {
    if (!canReschedule) {
      onError(
        "This booking is too close to the appointment time to reschedule online.",
      );
      return;
    }

    if (!selectedSlotStartsAt || selectedSlotStartsAt === booking.scheduledAt) {
      onError("Choose a different available slot before rescheduling.");
      return;
    }

    setIsRescheduling(true);

    try {
      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${booking.id}/reschedule`,
        {
          scheduledAt: selectedSlotStartsAt,
        },
        {
          headers: createAuthHeaders(token),
        },
      );

      onUpdated(response.data.data);
      setIsOpen(false);
    } catch (error) {
      onError(getApiErrorMessage(error, "Unable to reschedule this booking."));
    } finally {
      setIsRescheduling(false);
    }
  }

  async function handleCancel() {
    if (!canCancel) {
      onError(
        "This booking is too close to the appointment time to cancel online.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Cancel this booking? This will release the slot for new appointments.",
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);

    try {
      const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${booking.id}/cancel`,
        {
          reason: cancelReason,
        },
        {
          headers: createAuthHeaders(token),
        },
      );

      onUpdated(response.data.data);
      setIsOpen(false);
    } catch (error) {
      onError(getApiErrorMessage(error, "Unable to cancel this booking."));
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="mt-4 rounded-[1.2rem] border border-[color:var(--pc-line)] bg-white px-4 py-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
        >
          {isOpen ? "Close manage tools" : "Manage booking"}
        </button>
        <span className="rounded-full bg-[color:var(--pc-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
          {booking.status === "accepted"
            ? "Accepted bookings reset to pending after reschedule"
            : "Pending bookings keep their request status"}
        </span>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[1.1rem] bg-[color:var(--pc-surface)] p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                Reschedule
              </h4>
              <p className="mt-2 text-sm text-[color:var(--pc-muted)]">
                Current time: {formatDateTime(booking.scheduledAt)}
              </p>
              <label className="mt-4 block text-sm font-medium text-[color:var(--pc-ink)]">
                New date
                <input
                  type="date"
                  min={new Intl.DateTimeFormat("en-CA").format(today)}
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="mt-2 w-full rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                />
              </label>

              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-[color:var(--pc-ink)]">
                  Available slots
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {slotOptions.length > 0 ? (
                    slotOptions.map((slot) => {
                      const isSelectable = slot.isAvailable || slot.isCurrentBooking;
                      const isSelected = selectedSlotStartsAt === slot.startsAt;

                      return (
                        <button
                          key={slot.startsAt}
                          type="button"
                          disabled={!isSelectable}
                          onClick={() => setSelectedSlotStartsAt(slot.startsAt)}
                          className={`rounded-[1rem] border px-4 py-3 text-left text-sm transition ${
                            isSelected
                              ? "border-[color:var(--pc-ink)] bg-[color:var(--pc-ink)] text-white"
                              : isSelectable
                                ? "border-[color:var(--pc-line)] bg-white text-[color:var(--pc-ink)]"
                                : "cursor-not-allowed border-[color:var(--pc-line)] bg-white text-[color:var(--pc-muted)] opacity-60"
                          }`}
                        >
                          <p className="font-semibold">{slot.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em]">
                            {slot.isCurrentBooking ? "current" : slot.status}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-[1rem] border border-dashed border-[color:var(--pc-line)] bg-white px-4 py-5 text-sm text-[color:var(--pc-muted)] sm:col-span-2">
                      {isLoadingAvailability
                        ? "Loading slots for this date."
                        : "No slots published for this date."}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleReschedule}
                disabled={
                  isRescheduling ||
                  isLoadingAvailability ||
                  !canReschedule ||
                  !selectedSlotStartsAt ||
                  selectedSlotStartsAt === booking.scheduledAt
                }
                className="mt-4 rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRescheduling ? "Rescheduling..." : "Confirm reschedule"}
              </button>
              <p className="mt-3 text-xs text-[color:var(--pc-muted)]">
                Online reschedule is available until 12 hours before the appointment.
              </p>
            </section>

            <section className="rounded-[1.1rem] bg-[color:var(--pc-surface)] p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)]">
                Cancel booking
              </h4>
              <p className="mt-2 text-sm text-[color:var(--pc-muted)]">
                Cancelled appointments release the slot back to the doctor&apos;s live schedule.
              </p>
              <label className="mt-4 block text-sm font-medium text-[color:var(--pc-ink)]">
                Reason for cancellation
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  rows={4}
                  placeholder="Optional note for the doctor"
                  className="mt-2 w-full rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                />
              </label>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling || !canCancel}
                className="mt-4 rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCancelling ? "Cancelling..." : "Cancel booking"}
              </button>
              <p className="mt-3 text-xs text-[color:var(--pc-muted)]">
                Online cancellation is available until 2 hours before the appointment.
              </p>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
