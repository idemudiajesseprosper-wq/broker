import crypto from "node:crypto";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { createAccountForUser } from "@/utils/account";
import { serverError } from "@/utils/api";
import { sendVerificationEmail } from "@/utils/email";

export const runtime = "nodejs";

// Registers a client and sends a verification email.
export async function POST(req) {
  try {
    await connectDB();

    const { country, fullName, email, password, phone } = await req.json();

    if (!country || !fullName || !email || !password || !phone) {
      return Response.json(
        {
          error: "Full name, email, phone, country, and password are required",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser?.isVerified) {
      return Response.json({ error: "Email already taken" }, { status: 409 });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user =
      existingUser ||
      new User({
        email: normalizedEmail,
      });

    user.emailVerificationExpires = emailVerificationExpires;
    user.emailVerificationToken = emailVerificationToken;
    user.country = country;
    user.fullName = fullName;
    user.isVerified = false;
    user.password = password;
    user.phone = phone;

    await user.save();

    const emailResult = await sendVerificationEmail(
      user.email,
      emailVerificationToken,
    );

    if (emailResult?.skipped) {
      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      await createAccountForUser(user._id);

      return Response.json(
        {
          message:
            "Registration successful. Email is not configured locally, so your account was verified automatically.",
        },
        { status: 201 },
      );
    }

    return Response.json(
      { message: "Registration successful. Please verify your email." },
      { status: 201 },
    );
  } catch (error) {
    return serverError(error);
  }
}
