import bcrypt from "bcryptjs";
import { Schema, model, Document } from "mongoose";
import { UserRole, USER_ROLES } from "../types/auth";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: Object.values(USER_ROLES),
    },
    department: { type: String, trim: true, default: undefined },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const saltRounds = 10;
  const hashed = await bcrypt.hash(this.password, saltRounds);
  this.password = hashed;
  next();
});

userSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = model<UserDocument>("User", userSchema);

export default UserModel;
