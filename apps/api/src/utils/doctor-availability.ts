export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type ConsultationMode = "Clinic" | "Video";

export type AvailabilityWindow = {
  start: string;
  end: string;
};

export type DoctorAvailabilityDay = {
  dayOfWeek: DayOfWeek;
  windows: AvailabilityWindow[];
  isActive: boolean;
};

export type DoctorAvailabilityOverride = {
  date: string;
  windows: AvailabilityWindow[];
  isClosed: boolean;
};

export type DoctorBlockedSlot = {
  startsAt: string;
  reason?: string;
};

export type DoctorAvailabilitySlot = {
  startsAt: string;
  label: string;
  isAvailable: boolean;
  status: "available" | "booked" | "blocked" | "past";
};

export const dayOfWeekOrder: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const slotIntervalMinutes = 30;

export function createDefaultWeeklyAvailability(): DoctorAvailabilityDay[] {
  return [
    {
      dayOfWeek: "monday",
      windows: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
      isActive: true,
    },
    {
      dayOfWeek: "tuesday",
      windows: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
      isActive: true,
    },
    {
      dayOfWeek: "wednesday",
      windows: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
      isActive: true,
    },
    {
      dayOfWeek: "thursday",
      windows: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
      isActive: true,
    },
    {
      dayOfWeek: "friday",
      windows: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
      isActive: true,
    },
    {
      dayOfWeek: "saturday",
      windows: [{ start: "09:00", end: "12:00" }],
      isActive: true,
    },
    {
      dayOfWeek: "sunday",
      windows: [],
      isActive: false,
    },
  ];
}

function parseTimeToMinutes(time: string) {
  const [rawHours, rawMinutes] = time.split(":");
  const hours = Number(rawHours ?? "0");
  const minutes = Number(rawMinutes ?? "0");
  return hours * 60 + minutes;
}

function buildLocalIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function getDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayOfWeek(value: Date | string): DayOfWeek {
  const date = typeof value === "string" ? new Date(value) : value;
  return dayOfWeekOrder[(date.getDay() + 6) % 7]!;
}

function sortWindows(windows: AvailabilityWindow[]) {
  return [...windows].sort((left, right) => left.start.localeCompare(right.start));
}

export function normalizeWeeklyAvailability(
  availability: DoctorAvailabilityDay[],
): DoctorAvailabilityDay[] {
  const availabilityMap = new Map(
    availability.map((day) => [
      day.dayOfWeek,
      {
        dayOfWeek: day.dayOfWeek,
        isActive: day.isActive,
        windows: sortWindows(day.windows),
      } satisfies DoctorAvailabilityDay,
    ]),
  );

  return dayOfWeekOrder.map(
    (dayOfWeek) =>
      availabilityMap.get(dayOfWeek) ?? {
        dayOfWeek,
        windows: [],
        isActive: false,
      },
  );
}

export function normalizeAvailabilityOverrides(
  overrides: DoctorAvailabilityOverride[],
): DoctorAvailabilityOverride[] {
  return [...overrides]
    .map((override) => ({
      date: override.date,
      isClosed: override.isClosed,
      windows: sortWindows(override.windows),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function normalizeBlockedSlots(blockedSlots: DoctorBlockedSlot[]) {
  return [...blockedSlots]
    .map((slot) => ({
      startsAt: new Date(slot.startsAt).toISOString(),
      reason: slot.reason?.trim() ? slot.reason.trim() : undefined,
    }))
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

function resolveWindowsForDate(input: {
  date: string;
  availability: DoctorAvailabilityDay[];
  availabilityOverrides: DoctorAvailabilityOverride[];
}) {
  const override = input.availabilityOverrides.find(
    (candidate) => candidate.date === input.date,
  );

  if (override) {
    return override.isClosed ? [] : override.windows;
  }

  const dayConfig = input.availability.find(
    (candidate) => candidate.dayOfWeek === getDayOfWeek(new Date(`${input.date}T00:00:00`)),
  );

  if (!dayConfig || !dayConfig.isActive) {
    return [];
  }

  return dayConfig.windows;
}

export function getAvailabilitySlotsForDate(input: {
  date: string;
  availability: DoctorAvailabilityDay[];
  availabilityOverrides: DoctorAvailabilityOverride[];
  blockedSlotStarts: string[];
  bookedSlotStarts: string[];
  now?: Date;
}) {
  const windows = resolveWindowsForDate(input);
  const blockedSlotSet = new Set(input.blockedSlotStarts);
  const bookedSlotSet = new Set(input.bookedSlotStarts);
  const now = input.now ?? new Date();
  const slots: DoctorAvailabilitySlot[] = [];

  for (const window of windows) {
    const startMinutes = parseTimeToMinutes(window.start);
    const endMinutes = parseTimeToMinutes(window.end);

    for (
      let currentMinutes = startMinutes;
      currentMinutes + slotIntervalMinutes <= endMinutes;
      currentMinutes += slotIntervalMinutes
    ) {
      const hours = `${Math.floor(currentMinutes / 60)}`.padStart(2, "0");
      const minutes = `${currentMinutes % 60}`.padStart(2, "0");
      const startsAt = buildLocalIso(input.date, `${hours}:${minutes}`);
      const slotDate = new Date(startsAt);
      const isPast = slotDate.getTime() <= now.getTime();
      const isBlocked = blockedSlotSet.has(startsAt);
      const isBooked = bookedSlotSet.has(startsAt);
      const status = isPast
        ? "past"
        : isBlocked
          ? "blocked"
          : isBooked
            ? "booked"
            : "available";

      slots.push({
        startsAt,
        label: new Intl.DateTimeFormat("en-LK", {
          hour: "numeric",
          minute: "2-digit",
        }).format(slotDate),
        isAvailable: status === "available",
        status,
      });
    }
  }

  return slots;
}

export function findNextAvailableSlot(input: {
  availability: DoctorAvailabilityDay[];
  availabilityOverrides: DoctorAvailabilityOverride[];
  blockedSlotStarts: string[];
  bookedSlotStarts: string[];
  now?: Date;
  searchDays?: number;
}) {
  const now = input.now ?? new Date();
  const searchDays = input.searchDays ?? 21;

  for (let dayOffset = 0; dayOffset < searchDays; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    const dateKey = getDateKey(date);
    const slots = getAvailabilitySlotsForDate({
      date: dateKey,
      availability: input.availability,
      availabilityOverrides: input.availabilityOverrides,
      blockedSlotStarts: input.blockedSlotStarts,
      bookedSlotStarts: input.bookedSlotStarts,
      now,
    });
    const nextSlot = slots.find((slot) => slot.isAvailable);

    if (nextSlot) {
      return nextSlot.startsAt;
    }
  }

  return null;
}

export function formatRelativeAvailability(startsAt: string) {
  const slotDate = new Date(startsAt);
  const now = new Date();
  const slotDateKey = getDateKey(slotDate);
  const nowDateKey = getDateKey(now);

  if (slotDateKey === nowDateKey) {
    return `Today at ${new Intl.DateTimeFormat("en-LK", {
      hour: "numeric",
      minute: "2-digit",
    }).format(slotDate)}`;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (slotDateKey === getDateKey(tomorrow)) {
    return `Tomorrow at ${new Intl.DateTimeFormat("en-LK", {
      hour: "numeric",
      minute: "2-digit",
    }).format(slotDate)}`;
  }

  const dayDifference = Math.round(
    (new Date(`${slotDateKey}T00:00:00`).getTime() -
      new Date(`${nowDateKey}T00:00:00`).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (dayDifference >= 0 && dayDifference < 7) {
    return `${new Intl.DateTimeFormat("en-LK", {
      weekday: "long",
    }).format(slotDate)} at ${new Intl.DateTimeFormat("en-LK", {
      hour: "numeric",
      minute: "2-digit",
    }).format(slotDate)}`;
  }

  return new Intl.DateTimeFormat("en-LK", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(slotDate);
}
