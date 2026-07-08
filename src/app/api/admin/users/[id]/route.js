import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Investment from "@/models/Investment";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { badRequest, notFound, serverError } from "@/utils/api";
import { logAdminAction } from "@/utils/audit";

export const runtime = "nodejs";

export async function GET(req, context) {
  try {
    await connectDB();
    adminOnly(req);

    const { id } = await context.params;
    const [user, account, recentTransactions, activeInvestments] =
      await Promise.all([
        User.findOne({ _id: id, deletedAt: null }).select("-password"),
        Account.findOne({ userId: id }),
        Transaction.find({ userId: id }).sort({ createdAt: -1 }).limit(10),
        Investment.find({ status: "active", userId: id }).populate("planId"),
      ]);

    if (!user) {
      return notFound("User not found");
    }

    return Response.json(
      {
        account,
        activeInvestments,
        recentTransactions,
        user,
      },
      { status: 200 },
    );
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

export async function PATCH(req, context) {
  try {
    await connectDB();
    const admin = adminOnly(req);

    const { id } = await context.params;
    const body = await req.json();
    const allowed = [
      "country",
      "email",
      "fullName",
      "phone",
      "status",
      "username",
    ];
    const update = {};

    for (const key of allowed) {
      if (body[key] !== undefined) {
        update[key] = body[key];
      }
    }

    if (update.status && !["active", "suspended"].includes(update.status)) {
      return badRequest("Status must be active or suspended");
    }

    const previous = await User.findOne({ _id: id, deletedAt: null }).select(
      "-password",
    );

    if (!previous) {
      return notFound("User not found");
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (update.status) {
      await Account.findOneAndUpdate(
        { userId: id },
        { status: update.status },
        { new: true },
      );
    }

    await logAdminAction({
      action: update.status ? `User ${update.status}` : "User edited",
      adminId: admin.userId,
      ipAddress: req.headers.get("x-forwarded-for"),
      newValue: update,
      previousValue: previous.toObject(),
      userId: id,
    });

    return Response.json({ user }, { status: 200 });
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

export async function DELETE(req, context) {
  try {
    await connectDB();
    const admin = adminOnly(req);

    const { id } = await context.params;
    const user = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date(), status: "suspended" },
      { new: true },
    ).select("-password");

    if (!user) {
      return notFound("User not found");
    }

    await Account.findOneAndUpdate(
      { userId: id },
      { status: "suspended" },
      { new: true },
    );

    await logAdminAction({
      action: "User soft deleted",
      adminId: admin.userId,
      ipAddress: req.headers.get("x-forwarded-for"),
      newValue: { deletedAt: user.deletedAt, status: user.status },
      previousValue: { deletedAt: null },
      userId: id,
    });

    return Response.json({ user }, { status: 200 });
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
