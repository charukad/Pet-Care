import { z } from "zod";

const medicineSchema = z.object({
  name: z.string().trim().min(1, "Medicine name is required."),
  dosage: z.string().trim().max(100).optional().or(z.literal("")),
  frequency: z.string().trim().max(100).optional().or(z.literal("")),
  duration: z.string().trim().max(100).optional().or(z.literal("")),
  instructions: z.string().trim().max(240).optional().or(z.literal("")),
});

export const createPrescriptionSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking id is required."),
  diagnosis: z.string().trim().min(2, "Diagnosis is required."),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  followUp: z.string().trim().max(240).optional().or(z.literal("")),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required."),
});
