import { Request, Response } from "npm:express@4.19.2";
import Booking from "../models/Booking.ts";
import TimeSlot from "../models/TimeSlot.ts";
import mongoose from "mongoose";

// Define an interface for the TimeSlot document
interface ITimeSlot extends mongoose.Document {
  service: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
}

export const createBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { patient, timeSlot } = req.body;

    // Check if the time slot is available
    const slot = await TimeSlot.findById(timeSlot).session(session);
    if (!slot || slot.isBooked) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Time slot is not available" });
    }

    // Check if the time slot is on a holiday
    if (slot.isHoliday) {
      await session.abortTransaction();
      return res.status(400).json({ message: "This time slot is on a public holiday. Please choose another date." });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      timeSlot: slot._id
    }).session(session);

    if (conflictingBooking) {
      await session.abortTransaction();
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Create the booking
    const booking = new Booking({ patient, timeSlot });
    await booking.save({ session });

    // Mark the time slot as booked
    slot.isBooked = true;
    await slot.save({ session });

    await session.commitTransaction();
    res.status(201).json(booking);
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  } finally {
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.findByIdAndDelete(id).session(session);

    const slot = await TimeSlot.findById(booking.timeSlot).session(session);
    if (slot) {
      slot.isBooked = false;
      await slot.save({ session });
    }

    await session.commitTransaction();
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  } finally {
    session.endSession();
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
