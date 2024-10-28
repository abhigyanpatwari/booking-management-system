import mongoose from "mongoose";

interface IBusinessHours {
  dayOfWeek: number;     // 0-6 (Sunday-Saturday)
  openTime: string;      // e.g., "09:00"
  closeTime: string;     // e.g., "17:00"
  isClosedDay: boolean;  // For regular weekly off days
}

interface IHoliday {
  date: Date;
  description: string;
}

const BusinessHoursSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true },
  openTime: { type: String, required: true },
  closeTime: { type: String, required: true },
  isClosedDay: { type: Boolean, default: false }
});

const HolidaySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true }
});

const BusinessHours = mongoose.model<IBusinessHours>("BusinessHours", BusinessHoursSchema);
const Holiday = mongoose.model<IHoliday>("Holiday", HolidaySchema);

export { BusinessHours, Holiday };
