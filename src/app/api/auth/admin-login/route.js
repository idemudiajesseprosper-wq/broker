import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { ensureDefaultAdmin } from "@/utils/adminSeed";
import { serverError } from "@/utils/api";
import { generateToken } from "@/utils/generateToken";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Username/email and password are required" },
        { status: 400 },
      );
    }

    const identifier = String(email).toLowerCase().trim();
    const admin = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
      role: "admin",
    }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return Response.json(
        { error: "Invalid administrator credentials" },
        { status: 401 },
      );
    }

    if (admin.deletedAt || admin.status === "suspended") {
      return Response.json(
        { error: "This administrator account is unavailable." },
        { status: 403 },
      );
    }

    await User.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    const token = generateToken(admin._id.toString(), "admin");
    const response = NextResponse.json(
      {
        user: {
          id: admin._id.toString(),
          fullName: admin.fullName,
          email: admin.email,
        },
      },
      { status: 200 },
    );

    response.cookies.set({
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      name: "bsx_token",
      path: "/",
      sameSite: "strict",
      secure: req.nextUrl.protocol === "https:",
      value: token,
    });

    return response;
  } catch (error) {
    return serverError(error);
  }
}
