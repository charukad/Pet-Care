"use client";

import { useMemo, useState } from "react";
import type { Booking } from "@/types/app";

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-LK", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDateKey(isoString: string) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createMonthDays(viewDate: Date) {
  const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const startOffset = (start.getDay() + 6) % 7;
  const endOffset = 6 - ((end.getDay() + 6) % 7);
  const firstVisibleDay = new Date(start);
  firstVisibleDay.setDate(start.getDate() - startOffset);
  const lastVisibleDay = new Date(end);
  lastVisibleDay.setDate(end.getDate() + endOffset);
  const days: Date[] = [];

  for (
    const cursor = new Date(firstVisibleDay);
    cursor <= lastVisibleDay;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    days.push(new Date(cursor));
  }

  return days;
}

function getStatusClasses(status: Booking["status"]) {
  if (status === "accepted") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "completed") {
    return "bg-sky-100 text-sky-700";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "cancelled") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-amber-100 text-amber-700";
}

type BookingsCalendarProps = {
  bookings: Booking[];
  title: string;
  description: string;
  audience: "user" | "doctor";
};

export function BookingsCalendar({
  bookings,
  title,
  description,
  audience,
}: BookingsCalendarProps) {
  const [today] = useState(() => new Date());
  const initialMonth = useMemo(() => {
    const firstUpcomingBooking = [...bookings]
      .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))
      .find((booking) => new Date(booking.scheduledAt).getTime() >= today.getTime());

    return firstUpcomingBooking
      ? new Date(firstUpcomingBooking.scheduledAt)
      : today;
  }, [bookings, today]);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );
  const [selectedDateKey, setSelectedDateKey] = useState(getDateKey(initialMonth.toISOString()));

  const bookingsByDate = useMemo(() => {
    return bookings.reduce<Record<string, Booking[]>>((accumulator, booking) => {
      const dateKey = getDateKey(booking.scheduledAt);
      accumulator[dateKey] = [...(accumulator[dateKey] ?? []), booking].sort((left, right) =>
        left.scheduledAt.localeCompare(right.scheduledAt),
      );
      return accumulator;
    }, {});
  }, [bookings]);

  const monthDays = createMonthDays(currentMonth);
  const selectedDayBookings = bookingsByDate[selectedDateKey] ?? [];

  return (
    <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">{title}</h2>
          <p className="mt-1 text-sm text-[color:var(--pc-muted)]">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
            className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
          >
            Previous
          </button>
          <p className="min-w-[10rem] text-center text-sm font-semibold text-[color:var(--pc-ink)]">
            {formatMonthLabel(currentMonth)}
          </p>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
            className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--pc-muted)] sm:grid-cols-7">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <div key={label} className="px-3 py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-7">
        {monthDays.map((day) => {
          const dayKey = getDateKey(day.toISOString());
          const dayBookings = bookingsByDate[dayKey] ?? [];
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isSelected = selectedDateKey === dayKey;

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => setSelectedDateKey(dayKey)}
              className={`min-h-[7.5rem] rounded-[1.3rem] border p-3 text-left transition ${
                isSelected
                  ? "border-[color:var(--pc-ink)] bg-[color:var(--pc-ink)] text-white"
                  : "border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] text-[color:var(--pc-ink)] hover:border-[color:var(--pc-sky)]"
              } ${!isCurrentMonth ? "opacity-55" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{day.getDate()}</span>
                {dayBookings.length > 0 ? (
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      isSelected ? "bg-white/15 text-white" : "bg-white text-[color:var(--pc-ink)]"
                    }`}
                  >
                    {dayBookings.length} booking{dayBookings.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 space-y-2">
                {dayBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className={`rounded-[0.9rem] px-2.5 py-2 text-xs ${
                      isSelected ? "bg-white/12 text-white" : "bg-white text-[color:var(--pc-muted)]"
                    }`}
                  >
                    <p className="font-semibold">
                      {new Intl.DateTimeFormat("en-LK", {
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(booking.scheduledAt))}
                    </p>
                    <p className="mt-1 truncate">
                      {audience === "doctor"
                        ? `${booking.owner.name} · ${booking.pet.name}`
                        : `${booking.doctor.name} · ${booking.pet.name}`}
                    </p>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--pc-ink)]">
              {selectedDateKey}
            </h3>
            <p className="text-sm text-[color:var(--pc-muted)]">
              {selectedDayBookings.length} booking
              {selectedDayBookings.length === 1 ? "" : "s"} on this day
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {selectedDayBookings.length > 0 ? (
            selectedDayBookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-[1.1rem] border border-[color:var(--pc-line)] bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[color:var(--pc-ink)]">
                      {audience === "doctor" ? booking.owner.name : booking.doctor.name}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                      {booking.pet.name} · {booking.consultationMode}
                    </p>
                    <p className="mt-2 text-sm text-[color:var(--pc-muted)]">
                      {formatDateTime(booking.scheduledAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(booking.status)}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.1rem] border border-dashed border-[color:var(--pc-line)] bg-white px-4 py-5 text-sm text-[color:var(--pc-muted)]">
              No bookings scheduled on this day yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
