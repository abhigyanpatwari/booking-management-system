import { Router } from "npm:express@4.19.2";
import { getCurrentUser } from "../controllers/userController.ts";
import { getUserBookings } from "../controllers/bookingController.ts";
import { authenticateToken } from "../middlewares/authMiddleware.ts";

const router = Router();

// User routes
router.get('/users/me', authenticateToken, getCurrentUser);

// Booking routes
router.get('/bookings', authenticateToken, getUserBookings);

export default router;
