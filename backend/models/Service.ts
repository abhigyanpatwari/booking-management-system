import mongoose from "mongoose";

interface IService {
  name: string;
  description: string;
  duration: number;
  price: number;
  bookingTimeLimit: number;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    interval: number;
    isEnabled: boolean;
  }[];
}

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  bookingTimeLimit: { type: Number, required: true },
  schedule: [{
    dayOfWeek: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    interval: { type: Number, required: true },
    isEnabled: { type: Boolean, default: false }
  }]
});

const Service = mongoose.model<IService & mongoose.Document>('Service', serviceSchema);
export default Service;
