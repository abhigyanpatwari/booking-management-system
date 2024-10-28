import { Request, Response } from "npm:express@4.19.2";
import Booking from "../models/Booking.ts";
import TimeSlot from "../models/TimeSlot.ts";
import mongoose from "mongoose";
import User from "../models/User.ts";

// Define an interface for the TimeSlot document
interface ITimeSlot extends mongoose.Document {
  service: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
}

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { patient, timeSlot } = req.body;

    if (!patient || patient === "undefined") {
      return res.status(400).json({ message: "Valid patient ID is required" });
    }

    // Validate patient exists
    const existingPatient = await User.findById(patient);
    if (!existingPatient) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    // Check if the time slot is available
    const slot = await TimeSlot.findById(timeSlot);
    if (!slot || slot.isBooked) {
      return res.status(400).json({ message: "Time slot is not available" });
    }

    // Check if the time slot is on a holiday
    if (slot.isHoliday) {
      return res.status(400).json({ 
        message: "This time slot is on a public holiday. Please choose another date." 
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      timeSlot: slot._id
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Create the booking
    const booking = new Booking({ patient, timeSlot });
    await booking.save();

    // Mark the time slot as booked
    slot.isBooked = true;
    await slot.save();

    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getAllBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().populate("patient").populate("timeSlot");
    res.json(bookings);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("patient").populate("timeSlot");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.findByIdAndDelete(id);

    const slot = await TimeSlot.findById(booking.timeSlot);
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const bookings = await Booking.find({ patient: userId })
      .populate({
        path: 'timeSlot',
        populate: {
          path: 'service',
          select: 'name duration price'
        }
      })
      .sort({ 'timeSlot.startTime': 1 }); // Sort by upcoming appointments

    res.json(bookings);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
