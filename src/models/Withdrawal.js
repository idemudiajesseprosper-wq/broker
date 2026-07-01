import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    walletAddress: String,
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountName: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    notes: String,
    processedAt: Date,
  },
  { timestamps: true },
);

const Withdrawal =
  mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;
