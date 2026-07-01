import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  documentType: {
    type: String,
    enum: ["passport", "national_id", "drivers_license"],
    required: true,
  },
  frontImageUrl: String,
  backImageUrl: String,
  selfieUrl: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: String,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const KYC = mongoose.models.KYC || mongoose.model("KYC", kycSchema);

export default KYC;
