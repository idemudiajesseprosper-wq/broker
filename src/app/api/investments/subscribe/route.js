import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Bonus from "@/models/Bonus";
import Investment from "@/models/Investment";
import InvestmentPlan from "@/models/InvestmentPlan";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { badRequest, forbidden, serverError } from "@/utils/api";
import { fetchBtcUsdPrice } from "@/utils/bitcoin";
import { createNotification } from "@/utils/createNotification";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const { planId, amount } = await req.json();
    const investmentAmount = Number(amount);

    if (!planId || !investmentAmount) {
      return badRequest("Plan and amount are required");
    }

    const [user, account, plan] = await Promise.all([
      User.findById(userId),
      Account.findOne({ userId }),
      InvestmentPlan.findById(planId),
    ]);

    if (!user || user.kycStatus !== "approved") {
      return forbidden("KYC approval is required to invest");
    }

    if (!plan || !plan.isActive) {
      return badRequest("Investment plan is not available");
    }

    if (
      investmentAmount < plan.minAmount ||
      investmentAmount > plan.maxAmount
    ) {
      return badRequest("Amount is outside this plan's limits");
    }

    if (!account || account.balance < investmentAmount) {
      return badRequest("Insufficient balance");
    }

    const btcPriceAtEntry = await fetchBtcUsdPrice();
    const expectedReturn =
      investmentAmount + (investmentAmount * plan.roiPercent) / 100;
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + plan.durationDays * 86400000,
    );

    account.balance -= investmentAmount;
    account.btcHolding += investmentAmount / btcPriceAtEntry;
    if (plan.giftBonus) {
      account.totalBonus =
        Number(account.totalBonus || 0) + Number(plan.giftBonus || 0);
    }
    await account.save();

    const investment = await Investment.create({
      accountId: account._id,
      amountInvested: investmentAmount,
      btcPriceAtEntry,
      endDate,
      expectedReturn,
      planId,
      profit: expectedReturn - investmentAmount,
      startDate,
      status: "active",
      userId,
    });

    if (plan.giftBonus) {
      const giftBonus = Number(plan.giftBonus || 0);

      await Promise.all([
        Bonus.create({
          amount: giftBonus,
          bonusType: `${plan.name} gift bonus`,
          reason: `Gift bonus for joining ${plan.name}`,
          userId,
        }),
        Transaction.create({
          accountId: account._id,
          amount: giftBonus,
          note: `Gift bonus for joining ${plan.name}`,
          status: "approved",
          type: "bonus",
          userId,
        }),
      ]);
    }

    await createNotification(
      userId,
      "Investment started",
      `Your ${plan.name} investment of $${investmentAmount} has started`,
      "investment",
    );

    return Response.json({ investment }, { status: 201 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
