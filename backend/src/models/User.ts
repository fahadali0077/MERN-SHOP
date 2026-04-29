import { Schema, model, type Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin" | "moderator";
  refreshToken?: string;
  avatarUrl?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true, maxlength: 60 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role:     { type: String, enum: ["customer", "admin", "moderator"], default: "customer" },
    refreshToken:        { type: String, select: false },
    avatarUrl:           { type: String },
    passwordResetToken:  { type: String, select: false },
    passwordResetExpires:{ type: Date,   select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret["id"] = (ret["_id"] as { toString(): string }).toString();
        delete ret["_id"]; delete ret["__v"];
        delete ret["password"]; delete ret["refreshToken"];
        delete ret["passwordResetToken"]; delete ret["passwordResetExpires"];
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods["comparePassword"] = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Generate a random reset token, hash it for storage, return raw for email
userSchema.methods["createPasswordResetToken"] = function (): string {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return rawToken;
};

export const User = model<IUser>("User", userSchema);
