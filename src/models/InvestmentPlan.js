import mongoose from "mongoose";

const investmentPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  minAmount: {
    type: Number,
    required: true,
  },
  maxAmount: {
    type: Number,
    required: true,
  },
  roiPercent: {
    type: Number,
    required: true,
  },
  durationDays: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const InvestmentPlan =
  mongoose.models.InvestmentPlan ||
  mongoose.model("InvestmentPlan", investmentPlanSchema);

export default InvestmentPlan;
