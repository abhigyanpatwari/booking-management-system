import { Request, Response } from "npm:express@4.19.2";
import TimeSlot from "../models/TimeSlot.ts";
import Service from "../models/Service.ts";
import { getHolidays, isHoliday } from "../services/holidayService.ts";
import { generateTimeSlots } from "../utils/timeSlotGenerator.ts";

const COUNTRY_CODE = "US"; // Change this to the appropriate country code

export const createTimeSlot = async (req: Request, res: Response) => {
  try {
    const { service, startTime, endTime } = req.body;
    
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Validate time slot is within service period
    const slotStart = new Date(startTime);
    const slotEnd = new Date(endTime);
    const serviceStart = new Date(serviceDoc.startDate);
    const serviceEnd = new Date(serviceDoc.endDate);

    if (slotStart < serviceStart || slotEnd > serviceEnd) {
      return res.status(400).json({ 
        message: "Time slot is outside of service period",
        debug: {
          slotStart,
          slotEnd,
          serviceStart,
          serviceEnd
        }
      });
    }

    // Check for overlapping time slots
    const overlappingSlot = await TimeSlot.findOne({
      service,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        { startTime: { $gte: startTime, $lt: endTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ]
    });

    if (overlappingSlot) {
      return res.status(400).json({ message: "This time slot overlaps with an existing one" });
    }

    // Check if the date is a holiday
    const startDate = new Date(startTime);
    const holidays = await getHolidays(COUNTRY_CODE, startDate.getFullYear());
    const isHolidayDate = isHoliday(startDate, holidays);

    const timeSlot = new TimeSlot({ service, startTime, endTime, isHoliday: isHolidayDate });
    await timeSlot.save();
    res.status(201).json(timeSlot);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getAvailableTimeSlots = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const { service } = req.query;

    if (!service) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({ message: "Service not found" });
    }

    const query = {
      service,
      isBooked: false,
      startTime: {
        $gte: Math.max(currentDate.getTime(), serviceDoc.startDate.getTime()),
        $lte: serviceDoc.endDate
      }
    };

    const timeSlots = await TimeSlot.find(query)
      .populate('service')
      .sort({ startTime: 1 });

    res.json(timeSlots);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const updateTimeSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, isBooked } = req.body;
    const updatedTimeSlot = await TimeSlot.findByIdAndUpdate(
      id,
      { startTime, endTime, isBooked },
      { new: true }
    );
    res.json(updatedTimeSlot);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
};

export const deleteTimeSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TimeSlot.findByIdAndDelete(id);
    res.json({ message: "Time slot deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const generateTimeSlotsForService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Use service's date range
    const startDate = new Date(Math.max(new Date().getTime(), service.startDate.getTime()));
    const endDate = new Date(service.endDate);

    // Delete existing future slots
    await TimeSlot.deleteMany({
      service: serviceId,
      startTime: { $gte: startDate },
      isBooked: false
    });

    // Generate and save new slots
    const newSlots = await generateTimeSlots(service, startDate, endDate);
    const savedSlots = await TimeSlot.insertMany(newSlots);

    console.log(`Generated and saved ${savedSlots.length} slots for service ${service.name}`);

    res.json({ 
      message: "Time slots generated successfully",
      slotsGenerated: savedSlots.length
    });
  } catch (error) {
    console.error('Error generating time slots:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getTimeSlotsByService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const timeSlots = await TimeSlot.find({
      service: serviceId,
      startTime: { 
        $gte: Math.max(new Date().getTime(), service.startDate.getTime()),
        $lte: service.endDate
      }
    })
    .populate('service')
    .sort({ startTime: 1 });

    if (!timeSlots) {
      return res.status(404).json({ message: "No time slots found" });
    }

    res.json(timeSlots);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getAllTimeSlots = async (_req: Request, res: Response) => {
  try {
    const timeSlots = await TimeSlot.find({
      startTime: { $gte: new Date() }, // Only future time slots
      isBooked: false
    })
    .populate('service')
    .sort({ startTime: 1 });

    res.json(timeSlots);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
