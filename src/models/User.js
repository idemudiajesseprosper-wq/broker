import * as bcrypt from "bcryptjs";
import mongoose from "mongoose";

// User accounts for clients and admins.
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: "United States",
  },
  profilePicture: String,
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ["client", "admin"],
    default: "client",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  kycStatus: {
    type: String,
    enum: ["not_submitted", "pending", "approved", "rejected"],
    default: "not_submitted",
  },
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
    index: true,
  },
  deletedAt: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash new or changed passwords before saving the user document.
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare a submitted password against the stored bcrypt hash.
userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
