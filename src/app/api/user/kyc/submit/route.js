import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import KYC from "@/models/KYC";
import User from "@/models/User";
import { badRequest, serverError } from "@/utils/api";
import { uploadImageFile } from "@/utils/cloudinary";

export const runtime = "nodejs";

// Accepts KYC form-data, uploads documents, and starts admin review.
export async function POST(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const existingKyc = await KYC.findOne({ userId });

    if (existingKyc && ["pending", "approved"].includes(existingKyc.status)) {
      return badRequest("KYC already submitted");
    }

    const formData = await req.formData();
    const documentType = formData.get("documentType");
    const frontImage = formData.get("frontImage");
    const backImage = formData.get("backImage");
    const selfie = formData.get("selfie");

    if (!documentType || !frontImage || !backImage || !selfie) {
      return badRequest(
        "Document type, front image, back image, and selfie are required",
      );
    }

    const [frontImageUrl, backImageUrl, selfieUrl] = await Promise.all([
      uploadImageFile(frontImage),
      uploadImageFile(backImage),
      uploadImageFile(selfie),
    ]);

    await KYC.findOneAndUpdate(
      { userId },
      {
        backImageUrl,
        documentType,
        frontImageUrl,
        rejectionReason: undefined,
        reviewedAt: undefined,
        reviewedBy: undefined,
        selfieUrl,
        status: "pending",
        submittedAt: new Date(),
      },
      { new: true, upsert: true },
    );

    await User.findByIdAndUpdate(userId, { kycStatus: "pending" });

    return Response.json(
      { message: "KYC submitted. Awaiting review." },
      { status: 201 },
    );
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
