import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { ensureDefaultAdmin } from "@/utils/adminSeed";
import { serverError } from "@/utils/api";
import { generateToken } from "@/utils/generateToken";

export const runtime = "nodejs";

// Authenticates a verified user and returns a JWT for protected requests.
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
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (user.deletedAt || user.status === "suspended") {
      return Response.json(
        { error: "This account has been suspended. Contact support." },
        { status: 403 },
      );
    }

    if (!user.isVerified) {
      return Response.json(
        { message: "Please verify your email first." },
        { status: 403 },
      );
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = generateToken(user._id.toString(), user.role);
    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
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
