import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
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
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InvestmentPlan",
    required: true,
  },
  amountInvested: Number,
  expectedReturn: Number,
  profit: {
    type: Number,
    default: 0,
  },
  btcPriceAtEntry: Number,
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  completedAt: Date,
});

const Investment =
  mongoose.models.Investment || mongoose.model("Investment", investmentSchema);

export default Investment;
