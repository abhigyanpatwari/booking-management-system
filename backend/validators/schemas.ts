import { z } from "zod";

export const createBookingSchema = z.object({
  patient: z.string().min(1),
  timeSlot: z.string().min(1)
});

export const createTimeSlotSchema = z.object({
  service: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime()
});

export const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  duration: z.number().positive(),
  bookingTimeLimit: z.number().positive().default(30)
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  duration: z.number().positive().optional(),
  bookingTimeLimit: z.number().positive().optional()
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

export const updateTimeSlotSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  isBooked: z.boolean().optional()
});
