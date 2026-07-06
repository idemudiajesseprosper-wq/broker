import Cryptr from "cryptr";
import mongoose from "mongoose";

const cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY);
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

  this.password = cryptr.encrypt(this.password);
});

// decrypt password
userSchema.methods.decryptPassword = function () {
  return cryptr.decrypt(this.password);
};

userSchema.methods.comparePassword = function (enteredPassword) {
  const decryptedPassword = cryptr.decrypt(this.password);
  
  return decryptedPassword === enteredPassword;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
