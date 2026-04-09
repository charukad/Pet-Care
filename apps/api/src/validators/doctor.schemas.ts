import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):(00|30)$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isParsableDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

const availabilityWindowSchema = z
  .object({
    start: z.string().regex(timePattern, "Use 30-minute time intervals."),
    end: z.string().regex(timePattern, "Use 30-minute time intervals."),
  })
  .superRefine((value, context) => {
    if (value.start >= value.end) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Window end time must be after the start time.",
        path: ["end"],
      });
    }
  });

const availabilityDaySchema = z.object({
  dayOfWeek: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  windows: z.array(availabilityWindowSchema).max(6),
  isActive: z.boolean(),
});

const availabilityOverrideSchema = z
  .object({
    date: z.string().regex(datePattern, "Use YYYY-MM-DD format."),
    windows: z.array(availabilityWindowSchema).max(6),
    isClosed: z.boolean(),
  })
  .superRefine((value, context) => {
    if (!value.isClosed && value.windows.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Open override dates must include at least one time window.",
        path: ["windows"],
      });
    }
  });

const blockedSlotSchema = z.object({
  startsAt: z.string().trim().min(1, "Blocked slot time is required."),
  reason: z.string().trim().max(160).optional().or(z.literal("")),
});

export const updateDoctorAvailabilitySchema = z
  .object({
    availability: z.array(availabilityDaySchema).min(7).max(7),
    availabilityOverrides: z.array(availabilityOverrideSchema).max(30),
    blockedSlots: z.array(blockedSlotSchema).max(200),
  })
  .superRefine((value, context) => {
    const uniqueDays = new Set(value.availability.map((day) => day.dayOfWeek));
    const uniqueOverrideDates = new Set(
      value.availabilityOverrides.map((override) => override.date),
    );

    if (uniqueDays.size !== 7) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Availability must include one entry for each day of the week.",
        path: ["availability"],
      });
    }

    if (uniqueOverrideDates.size !== value.availabilityOverrides.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only one override can be stored for each date.",
        path: ["availabilityOverrides"],
      });
    }

    value.blockedSlots.forEach((blockedSlot, index) => {
      if (!isParsableDate(blockedSlot.startsAt)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Blocked slot must be a valid date and time.",
          path: ["blockedSlots", index, "startsAt"],
        });
      }
    });
  });
