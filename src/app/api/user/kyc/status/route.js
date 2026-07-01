import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import KYC from "@/models/KYC";
import { serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const kyc = await KYC.findOne({ userId }).select(
      "documentType rejectionReason status submittedAt",
    );

    if (!kyc) {
      return Response.json({ status: "not_submitted" }, { status: 200 });
    }

    return Response.json(
      {
        documentType: kyc.documentType,
        rejectionReason: kyc.rejectionReason,
        status: kyc.status,
        submittedAt: kyc.submittedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
