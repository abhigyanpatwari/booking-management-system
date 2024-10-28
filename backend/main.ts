import express from "npm:express@4.19.2"
import cors from "npm:cors@2.8.5"
import mongoose from "npm:mongoose@7.6.3"
import router from "./routes/router.ts"
import { load } from "https://deno.land/std/dotenv/mod.ts"
import { seedAdmin } from "./seeds/adminSeed.ts"

// Load environment variables
await load({ export: true });

const app = express()

app.use(cors())
app.use(express.json())

// MongoDB connection
const MONGODB_URI = Deno.env.get("MONGODB_URI")!;

try {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
  
  // Seed admin user if it doesn't exist
  await seedAdmin();
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
  Deno.exit(1);
}

app.use("/api/v1", router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
