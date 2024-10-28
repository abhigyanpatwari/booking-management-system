import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: "patient" | "admin";
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAdmin: boolean;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "admin"], default: "patient" },
  isAdmin: { type: Boolean, default: false },
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return this.password === candidatePassword;
};

export default mongoose.model<IUser>("User", UserSchema);
