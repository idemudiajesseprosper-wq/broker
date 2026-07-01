import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import KYC from "@/models/KYC";
import User from "@/models/User";
import { badRequest, notFound, serverError } from "@/utils/api";
import { createNotification } from "@/utils/createNotification";
import { sendPlainEmail } from "@/utils/email";

export const runtime = "nodejs";

export async function PUT(req, context) {
  try {
    await connectDB();

    const admin = adminOnly(req);
    const { id } = await context.params;
    const { status, rejectionReason } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return badRequest("Status must be approved or rejected");
    }

    const kyc = await KYC.findById(id);

    if (!kyc) {
      return notFound("KYC record not found");
    }

    kyc.status = status;
    kyc.rejectionReason = status === "rejected" ? rejectionReason : undefined;
    kyc.reviewedAt = new Date();
    kyc.reviewedBy = admin.userId;
    await kyc.save();

    const user = await User.findByIdAndUpdate(
      kyc.userId,
      { kycStatus: status },
      { new: true },
    );

    await createNotification(
      kyc.userId,
      "KYC review complete",
      status === "approved"
        ? "Your KYC has been approved."
        : `Your KYC was rejected. ${rejectionReason || ""}`.trim(),
      "kyc",
    );

    if (user) {
      await sendPlainEmail(
        user.email,
        "KYC review complete",
        status === "approved"
          ? "Your KYC has been approved."
          : `Your KYC was rejected. ${rejectionReason || ""}`.trim(),
      );
    }

    return Response.json({ kyc }, { status: 200 });
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
