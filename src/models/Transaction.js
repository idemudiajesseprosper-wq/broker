import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "deposit",
      "withdrawal",
      "profit",
      "bonus",
      "penalty",
      "balance_adjustment",
    ],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "failed"],
    default: "pending",
  },
  paystackReference: String,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
  },
  note: String,
  processedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
