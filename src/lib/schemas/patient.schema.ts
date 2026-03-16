import { z } from "zod";

export const BloodGroupValues = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const PatientCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date < new Date();
    }, "Date of birth must be in the past"),
  bloodGroup: z.enum(BloodGroupValues).optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional(),
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

export type PatientCreateInput = z.infer<typeof PatientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;
