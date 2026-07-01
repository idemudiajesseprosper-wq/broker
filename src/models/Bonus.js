import mongoose from "mongoose";

const bonusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    bonusType: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true },
    description: String,
    expirationDate: Date,
    status: {
      type: String,
      enum: ["active", "expired", "deleted"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const Bonus = mongoose.models.Bonus || mongoose.model("Bonus", bonusSchema);

export default Bonus;
