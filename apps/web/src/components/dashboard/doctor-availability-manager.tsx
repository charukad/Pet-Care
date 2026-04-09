"use client";

import { useEffect, useState } from "react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import type {
  AvailabilityWindow,
  DayOfWeek,
  DoctorAvailabilityDay,
  DoctorAvailabilityManagerView,
  DoctorAvailabilityOverride,
  DoctorBlockedSlot,
} from "@/types/app";

const dayLabels: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function createWindow(start = "09:00", end = "12:00"): AvailabilityWindow {
  return { start, end };
}

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

type DoctorAvailabilityManagerProps = {
  token: string;
};

export function DoctorAvailabilityManager({
  token,
}: DoctorAvailabilityManagerProps) {
  const [data, setData] = useState<DoctorAvailabilityManagerView | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailabilityDay[]>([]);
  const [availabilityOverrides, setAvailabilityOverrides] = useState<
    DoctorAvailabilityOverride[]
  >([]);
  const [blockedSlots, setBlockedSlots] = useState<DoctorBlockedSlot[]>([]);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideIsClosed, setOverrideIsClosed] = useState(false);
  const [overrideWindows, setOverrideWindows] = useState<AvailabilityWindow[]>([
    createWindow(),
  ]);
  const [blockedSlotDate, setBlockedSlotDate] = useState("");
  const [blockedSlotTime, setBlockedSlotTime] = useState("09:00");
  const [blockedSlotReason, setBlockedSlotReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void api
      .get<ApiResponse<DoctorAvailabilityManagerView>>("/doctors/me/availability", {
        headers: createAuthHeaders(token),
      })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const managerData = response.data.data;
        setData(managerData);
        setAvailability(managerData.availability);
        setAvailabilityOverrides(managerData.availabilityOverrides);
        setBlockedSlots(managerData.blockedSlots);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load availability settings."),
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  function updateDay(dayOfWeek: DayOfWeek, updater: (day: DoctorAvailabilityDay) => DoctorAvailabilityDay) {
    setAvailability((currentDays) =>
      currentDays.map((day) => (day.dayOfWeek === dayOfWeek ? updater(day) : day)),
    );
    setSuccessMessage(null);
  }

  function addWindowToDay(dayOfWeek: DayOfWeek) {
    updateDay(dayOfWeek, (day) => ({
      ...day,
      isActive: true,
      windows: [...day.windows, createWindow("13:00", "17:00")],
    }));
  }

  function addOverride() {
    if (!overrideDate) {
      setErrorMessage("Choose a date before adding an override.");
      return;
    }

    if (
      availabilityOverrides.some((override) => override.date === overrideDate)
    ) {
      setErrorMessage("An override already exists for that date.");
      return;
    }

    setAvailabilityOverrides((currentOverrides) =>
      [...currentOverrides, {
        date: overrideDate,
        isClosed: overrideIsClosed,
        windows: overrideIsClosed ? [] : overrideWindows,
      }].sort((left, right) => left.date.localeCompare(right.date)),
    );
    setOverrideDate("");
    setOverrideIsClosed(false);
    setOverrideWindows([createWindow()]);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function addBlockedSlot() {
    if (!blockedSlotDate) {
      setErrorMessage("Choose a date before blocking a slot.");
      return;
    }

    const startsAt = new Date(`${blockedSlotDate}T${blockedSlotTime}:00`).toISOString();

    if (blockedSlots.some((slot) => slot.startsAt === startsAt)) {
      setErrorMessage("That slot is already blocked.");
      return;
    }

    setBlockedSlots((currentSlots) =>
      [...currentSlots, { startsAt, reason: blockedSlotReason.trim() || undefined }].sort(
        (left, right) => left.startsAt.localeCompare(right.startsAt),
      ),
    );
    setBlockedSlotDate("");
    setBlockedSlotTime("09:00");
    setBlockedSlotReason("");
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function saveAvailability() {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await api.put<ApiResponse<DoctorAvailabilityManagerView>>(
        "/doctors/me/availability",
        {
          availability,
          availabilityOverrides,
          blockedSlots,
        },
        {
          headers: createAuthHeaders(token),
        },
      );

      const managerData = response.data.data;
      setData(managerData);
      setAvailability(managerData.availability);
      setAvailabilityOverrides(managerData.availabilityOverrides);
      setBlockedSlots(managerData.blockedSlots);
      setSuccessMessage("Availability settings saved.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to save availability settings."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
        <p className="text-sm text-[color:var(--pc-muted)]">
          Loading your schedule settings.
        </p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
        <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
          Availability settings
        </h2>
        <p className="mt-3 text-sm text-rose-700">
          {errorMessage ?? "Availability settings could not be loaded."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--pc-ink)]">
            Availability manager
          </h2>
          <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
            Publish recurring clinic hours, add one-off overrides, and block
            specific slots before pet owners book them.
          </p>
        </div>
        <div className="rounded-[1.2rem] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-muted)]">
          <p className="font-semibold text-[color:var(--pc-ink)]">
            Next open slot
          </p>
          <p className="mt-1">
            {data.nextAvailable ? formatDateTime(data.nextAvailable) : "No upcoming slots"}
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-5 rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--pc-ink)]">
              Weekly schedule
            </h3>
            <div className="mt-4 space-y-3">
              {availability.map((day) => (
                <article
                  key={day.dayOfWeek}
                  className="rounded-[1.4rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-[color:var(--pc-ink)]">
                        {dayLabels[day.dayOfWeek]}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                        {day.isActive
                          ? `${day.windows.length} time window${day.windows.length === 1 ? "" : "s"} published`
                          : "Closed"}
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-[color:var(--pc-ink)]">
                      <input
                        type="checkbox"
                        checked={day.isActive}
                        onChange={(event) =>
                          updateDay(day.dayOfWeek, (currentDay) => ({
                            ...currentDay,
                            isActive: event.target.checked,
                            windows:
                              event.target.checked && currentDay.windows.length === 0
                                ? [createWindow()]
                                : currentDay.windows,
                          }))
                        }
                      />
                      Open for booking
                    </label>
                  </div>

                  {day.isActive ? (
                    <div className="mt-4 space-y-3">
                      {day.windows.map((window, index) => (
                        <div
                          key={`${day.dayOfWeek}-${index}`}
                          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                        >
                          <input
                            type="time"
                            step={1800}
                            value={window.start}
                            onChange={(event) =>
                              updateDay(day.dayOfWeek, (currentDay) => ({
                                ...currentDay,
                                windows: currentDay.windows.map((candidate, candidateIndex) =>
                                  candidateIndex === index
                                    ? { ...candidate, start: event.target.value }
                                    : candidate,
                                ),
                              }))
                            }
                            className="rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                          />
                          <input
                            type="time"
                            step={1800}
                            value={window.end}
                            onChange={(event) =>
                              updateDay(day.dayOfWeek, (currentDay) => ({
                                ...currentDay,
                                windows: currentDay.windows.map((candidate, candidateIndex) =>
                                  candidateIndex === index
                                    ? { ...candidate, end: event.target.value }
                                    : candidate,
                                ),
                              }))
                            }
                            className="rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateDay(day.dayOfWeek, (currentDay) => ({
                                ...currentDay,
                                windows:
                                  currentDay.windows.length === 1
                                    ? currentDay.windows
                                    : currentDay.windows.filter(
                                        (_, candidateIndex) => candidateIndex !== index,
                                      ),
                              }))
                            }
                            className="rounded-full border border-[color:var(--pc-line)] px-4 py-3 text-sm font-medium text-[color:var(--pc-ink)]"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addWindowToDay(day.dayOfWeek)}
                        className="rounded-full border border-[color:var(--pc-line)] px-4 py-3 text-sm font-medium text-[color:var(--pc-ink)]"
                      >
                        Add window
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--pc-ink)]">
                  Date overrides
                </h3>
                <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                  Use these for one-off openings or full-day closures.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="date"
                  value={overrideDate}
                  onChange={(event) => setOverrideDate(event.target.value)}
                  className="rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                />
                <label className="inline-flex items-center gap-2 rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]">
                  <input
                    type="checkbox"
                    checked={overrideIsClosed}
                    onChange={(event) => setOverrideIsClosed(event.target.checked)}
                  />
                  Closed all day
                </label>
              </div>

              {!overrideIsClosed ? (
                <div className="mt-4 space-y-3">
                  {overrideWindows.map((window, index) => (
                    <div
                      key={`override-window-${index}`}
                      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <input
                        type="time"
                        step={1800}
                        value={window.start}
                        onChange={(event) =>
                          setOverrideWindows((currentWindows) =>
                            currentWindows.map((candidate, candidateIndex) =>
                              candidateIndex === index
                                ? { ...candidate, start: event.target.value }
                                : candidate,
                            ),
                          )
                        }
                        className="rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                      />
                      <input
                        type="time"
                        step={1800}
                        value={window.end}
                        onChange={(event) =>
                          setOverrideWindows((currentWindows) =>
                            currentWindows.map((candidate, candidateIndex) =>
                              candidateIndex === index
                                ? { ...candidate, end: event.target.value }
                                : candidate,
                            ),
                          )
                        }
                        className="rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOverrideWindows((currentWindows) =>
                            currentWindows.length === 1
                              ? currentWindows
                              : currentWindows.filter(
                                  (_, candidateIndex) => candidateIndex !== index,
                                ),
                          )
                        }
                        className="rounded-full border border-[color:var(--pc-line)] px-4 py-3 text-sm font-medium text-[color:var(--pc-ink)]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setOverrideWindows((currentWindows) => [
                        ...currentWindows,
                        createWindow("13:00", "16:00"),
                      ])
                    }
                    className="rounded-full border border-[color:var(--pc-line)] px-4 py-3 text-sm font-medium text-[color:var(--pc-ink)]"
                  >
                    Add override window
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={addOverride}
                className="mt-4 rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Add date override
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {availabilityOverrides.length > 0 ? (
                availabilityOverrides.map((override) => (
                  <article
                    key={override.date}
                    className="rounded-[1.4rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-[color:var(--pc-ink)]">
                          {override.date}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                          {override.isClosed
                            ? "Closed all day"
                            : override.windows
                                .map((window) => `${window.start} - ${window.end}`)
                                .join(" | ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setAvailabilityOverrides((currentOverrides) =>
                            currentOverrides.filter(
                              (candidate) => candidate.date !== override.date,
                            ),
                          )
                        }
                        className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)]"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-5 text-sm text-[color:var(--pc-muted)]">
                  No custom date overrides yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--pc-ink)]">
              Block specific slots
            </h3>
            <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
              Use blocked slots for breaks, emergencies, or already promised
              offline appointments.
            </p>

            <div className="mt-4 rounded-[1.4rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4">
              <div className="grid gap-3">
                <input
                  type="date"
                  value={blockedSlotDate}
                  onChange={(event) => setBlockedSlotDate(event.target.value)}
                  className="rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                />
                <input
                  type="time"
                  step={1800}
                  value={blockedSlotTime}
                  onChange={(event) => setBlockedSlotTime(event.target.value)}
                  className="rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                />
                <input
                  value={blockedSlotReason}
                  onChange={(event) => setBlockedSlotReason(event.target.value)}
                  placeholder="Reason (optional)"
                  className="rounded-[1rem] border border-[color:var(--pc-line)] bg-white px-4 py-3 text-sm text-[color:var(--pc-ink)]"
                />
              </div>
              <button
                type="button"
                onClick={addBlockedSlot}
                className="mt-4 rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Block slot
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {blockedSlots.length > 0 ? (
              blockedSlots.map((slot) => (
                <article
                  key={slot.startsAt}
                  className="rounded-[1.4rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-[color:var(--pc-ink)]">
                        {formatDateTime(slot.startsAt)}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                        {slot.reason ?? "Blocked without a note"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setBlockedSlots((currentSlots) =>
                          currentSlots.filter(
                            (candidate) => candidate.startsAt !== slot.startsAt,
                          ),
                        )
                      }
                      className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)]"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-5 text-sm text-[color:var(--pc-muted)]">
                No blocked slots yet.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={saveAvailability}
            disabled={isSaving}
            className="w-full rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving schedule..." : "Save availability"}
          </button>
        </div>
      </div>
    </section>
  );
}
