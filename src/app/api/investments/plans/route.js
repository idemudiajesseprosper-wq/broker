import { connectDB } from "@/config/db";
import InvestmentPlan from "@/models/InvestmentPlan";
import { serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const plans = await InvestmentPlan.find({ isActive: true }).sort({
      minAmount: 1,
    });

    return Response.json({ plans }, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
