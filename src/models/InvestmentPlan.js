import mongoose from "mongoose";

const investmentPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  defaultAmount: {
    type: Number,
    default: 0,
  },
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
  minReturn: {
    type: Number,
    default: 0,
  },
  maxReturn: {
    type: Number,
    default: 0,
  },
  giftBonus: {
    type: Number,
    default: 0,
  },
  currencySymbol: {
    type: String,
    default: "£",
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
