import { Application } from "npm:express@4.19.2";
import mongoose from "mongoose";
import router from "./routes/router.ts";
import { seedAdmin } from "./seeds/adminSeed.ts";

const app = new Application();
const PORT = 3000;

mongoose.connect("mongodb://localhost:27017/booking_system")
  .then(async () => {
    console.log("Connected to MongoDB");
    // Seed admin user
    await seedAdmin();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
