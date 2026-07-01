import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: "Manual" },
    transactionReference: { type: String, trim: true, index: true },
    paymentProof: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    internalNote: String,
    processedAt: Date,
  },
  { timestamps: true },
);

const Deposit =
  mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);

export default Deposit;
