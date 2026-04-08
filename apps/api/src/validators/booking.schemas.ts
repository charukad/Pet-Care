import { z } from "zod";

export const createBookingSchema = z.object({
  doctorProfileId: z.string().trim().min(1, "Doctor is required."),
  petId: z.string().trim().min(1, "Pet is required."),
  scheduledAt: z.string().trim().min(1, "Scheduled date and time is required."),
  consultationMode: z.enum(["Clinic", "Video"]).default("Clinic"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const updateBookingStatusSchema = z
  .object({
    status: z.enum(["accepted", "rejected", "completed"]),
    rejectionReason: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .superRefine((value, context) => {
    if (value.status === "rejected" && !value.rejectionReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A rejection reason is required when rejecting a booking.",
        path: ["rejectionReason"],
      });
    }
  });
