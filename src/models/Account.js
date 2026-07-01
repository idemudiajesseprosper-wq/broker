import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  accountNumber: {
    type: String,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  totalDeposited: {
    type: Number,
    default: 0,
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  totalProfit: {
    type: Number,
    default: 0,
  },
  btcHolding: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Account =
  mongoose.models.Account || mongoose.model("Account", accountSchema);

export default Account;
