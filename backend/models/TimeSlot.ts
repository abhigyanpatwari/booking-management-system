import mongoose from "mongoose";
import Service from "./Service.ts";

interface ITimeSlot {
  service: mongoose.Types.ObjectId | {
    _id: mongoose.Types.ObjectId;
    name: string;
    duration: number;
    price: number;
    startDate: Date;
    endDate: Date;
  };
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  isHoliday: boolean;
}

interface ITimeSlotDocument extends ITimeSlot, mongoose.Document {
  service: ITimeSlot['service'];
}

const timeSlotSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
  isHoliday: { type: Boolean, default: false }
});

const TimeSlot = mongoose.model<ITimeSlotDocument>('TimeSlot', timeSlotSchema);
export default TimeSlot;
