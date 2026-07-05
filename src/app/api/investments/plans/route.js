import { connectDB } from "@/config/db";
import InvestmentPlan from "@/models/InvestmentPlan";
import { serverError } from "@/utils/api";
import { ensureDefaultInvestmentPlans } from "@/utils/investmentPlans";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    await ensureDefaultInvestmentPlans();

    const plans = await InvestmentPlan.find({ isActive: true }).sort({
      defaultAmount: 1,
      minAmount: 1,
    });

    return Response.json({ plans }, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
