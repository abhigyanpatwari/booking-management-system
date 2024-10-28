import mongoose from "mongoose";
import User from "../models/User.ts";

export const seedAdmin = async () => {
  try {
    console.log('Checking for existing admin...');
    const existingAdmin = await User.findOne({ email: "admin@admin.com" });
    
    if (!existingAdmin) {
      console.log('No admin found, creating new admin user...');
      
      const admin = new User({
        name: "Admin",
        email: "admin@admin.com",
        password: "admin123",
        role: "admin",
        isAdmin: true
      });
      
      await admin.save();
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};
