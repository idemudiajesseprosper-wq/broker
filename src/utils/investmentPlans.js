import InvestmentPlan from "@/models/InvestmentPlan";

export const defaultInvestmentPlans = [
  {
    currencySymbol: "$",
    defaultAmount: 500,
    description: "Starter package for new investors.",
    durationDays: 7,
    giftBonus: 100,
    maxAmount: 1000,
    maxReturn: 70,
    minAmount: 200,
    minReturn: 60,
    name: "Starter",
    roiPercent: 14,
  },
  {
    currencySymbol: "$",
    defaultAmount: 1000,
    description: "Standard package for growing weekly returns.",
    durationDays: 7,
    giftBonus: 200,
    maxAmount: 2000,
    maxReturn: 80,
    minAmount: 500,
    minReturn: 70,
    name: "Standard",
    roiPercent: 8,
  },
  {
    currencySymbol: "$",
    defaultAmount: 5000,
    description: "Premium package for larger weekly subscriptions.",
    durationDays: 7,
    giftBonus: 1000,
    maxAmount: 10000,
    maxReturn: 200,
    minAmount: 5000,
    minReturn: 100,
    name: "Premium",
    roiPercent: 4,
  },
];

export async function ensureDefaultInvestmentPlans() {
  await Promise.all(
    defaultInvestmentPlans.map(({ currencySymbol, ...plan }) =>
      InvestmentPlan.updateOne(
        { name: plan.name },
        { $set: { currencySymbol }, $setOnInsert: plan },
        { upsert: true },
      ),
    ),
  );
}
