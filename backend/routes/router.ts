import express, { Router, Request, Response } from "npm:express@4.19.2";
import * as serviceController from "../controllers/serviceController.ts";
import * as timeSlotController from "../controllers/timeSlotController.ts";
import * as bookingController from "../controllers/bookingController.ts";
import * as userController from "../controllers/userController.ts";
import * as authController from "../controllers/authController.ts";
import * as oauthController from "../controllers/oauthController.ts";
import { validate } from "../middlewares/validate.ts";
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.ts";
import { 
  createBookingSchema, 
  createTimeSlotSchema, 
  createServiceSchema, 
  createUserSchema,
  updatePasswordSchema,
  updateServiceSchema,
  updateTimeSlotSchema
} from "../validators/schemas.ts";
import { getHolidays } from "../services/holidayService.ts";

const router = Router();
const adminRouter = Router();

// Auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/auth/google", oauthController.initiateOAuth);
router.get("/auth/google/callback", oauthController.handleOAuthCallback);

// Public routes
router.get("/services", serviceController.getAllServices);
router.get("/timeslots", timeSlotController.getAllTimeSlots);
router.get("/services/:serviceId/timeslots", timeSlotController.getTimeSlotsByService);

// Protected routes (non-admin)
router.use(authenticateToken);
router.post("/bookings", validate(createBookingSchema), bookingController.createBooking);
router.get("/bookings", bookingController.getUserBookings);
router.get("/bookings/:id", bookingController.getBookingById);
router.delete("/bookings/:id", authenticateToken, bookingController.cancelBooking);

// User routes
router.get("/users/me", userController.getCurrentUser);

// Admin routes
router.get("/admin/check", (_req: Request, res: Response) => res.json({ isAdmin: true }));
router.get("/admin/services", serviceController.getAllServices);
router.post("/admin/services", serviceController.createService);
router.put("/admin/services/:id", serviceController.updateService);
router.delete("/admin/services/:id", serviceController.deleteService);
router.get("/admin/bookings", bookingController.getAllBookings);
router.post("/admin/services/:serviceId/generate-slots", timeSlotController.generateTimeSlotsForService);

export default router;
