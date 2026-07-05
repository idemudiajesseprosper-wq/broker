import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import InvestmentPlan from "@/models/InvestmentPlan";
import { notFound, serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function PUT(req, context) {
  try {
    await connectDB();
    adminOnly(req);

    const { id } = await context.params;
    const updates = await req.json();
    const allowedUpdates = [
      "currencySymbol",
      "defaultAmount",
      "description",
      "durationDays",
      "giftBonus",
      "isActive",
      "maxAmount",
      "maxReturn",
      "minAmount",
      "minReturn",
      "name",
      "roiPercent",
    ];
    const updatePayload = {};

    for (const key of allowedUpdates) {
      if (Object.hasOwn(updates, key)) {
        updatePayload[key] = updates[key];
      }
    }

    const plan = await InvestmentPlan.findByIdAndUpdate(id, updatePayload, {
      new: true,
    });

    if (!plan) {
      return notFound("Investment plan not found");
    }

    return Response.json({ plan }, { status: 200 });
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
