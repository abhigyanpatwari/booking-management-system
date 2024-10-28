import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: "TimeSlot", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", BookingSchema);

