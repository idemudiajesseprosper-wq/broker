import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import InvestmentPlan from "@/models/InvestmentPlan";
import { badRequest, serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();
    adminOnly(req);

    const {
      name,
      description,
      minAmount,
      maxAmount,
      roiPercent,
      durationDays,
    } = await req.json();

    if (!name || !minAmount || !maxAmount || !roiPercent || !durationDays) {
      return badRequest("Name, amounts, ROI, and duration are required");
    }

    const plan = await InvestmentPlan.create({
      description,
      durationDays,
      maxAmount,
      minAmount,
      name,
      roiPercent,
    });

    return Response.json({ plan }, { status: 201 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.status === 403) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return serverError(error);
  }
}
