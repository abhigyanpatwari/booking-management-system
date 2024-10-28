import mongoose from "mongoose";

interface IService {
  name: string;
  description: string;
  duration: number;
  price: number;
  startDate: Date;
  endDate: Date;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    interval: number;
    isEnabled: boolean;
  }>;
}

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  schedule: [{
    dayOfWeek: Number,
    startTime: String,
    endTime: String,
    interval: Number,
    isEnabled: Boolean
  }]
});

const Service = mongoose.model<IService & mongoose.Document>('Service', serviceSchema);
export default Service;
