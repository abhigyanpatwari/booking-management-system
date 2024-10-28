import { Request, Response } from "npm:express@4.19.2";
import Service from "../models/Service.ts";

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, duration, price, schedule, startDate, endDate } = req.body;
    
    console.log('Received service data:', {
      name,
      duration: { value: duration, type: typeof duration },
      price: { value: price, type: typeof price },
      schedule: schedule.length,
      startDate,
      endDate
    });

    // Convert string values to numbers
    const serviceData = {
      name,
      description,
      duration: Number(duration),
      price: Number(price),
      startDate,
      endDate,
      schedule: schedule.map((slot: any) => ({
        ...slot,
        interval: Number(slot.interval)
      }))
    };

    // Validate the data
    if (isNaN(serviceData.duration) || isNaN(serviceData.price)) {
      return res.status(400).json({ 
        message: "Duration and price must be valid numbers",
        debug: {
          receivedDuration: duration,
          receivedPrice: price,
          parsedDuration: serviceData.duration,
          parsedPrice: serviceData.price
        }
      });
    }

    const service = new Service(serviceData);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('Service creation error:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getAllServices = async (_req: Request, res: Response) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price } = req.body;
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { name, description, duration, price },
      { new: true }
    );
    res.json(updatedService);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};


