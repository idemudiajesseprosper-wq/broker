import crypto from "node:crypto";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { createAccountForUser } from "@/utils/account";
import { serverError } from "@/utils/api";
import { sendVerificationEmail } from "@/utils/email";
import { isAcceptablePassword } from "@/utils/password";
import { normalizePhoneNumber } from "@/utils/phone";
import { notifySmartsuppSignup } from "@/utils/smartsupp";

export const runtime = "nodejs";

// Registers a client and sends a verification email.
export async function POST(req) {
  try {
    await connectDB();

    const { country, fullName, email, password, phone, username } =
      await req.json();

    if (!country || !fullName || !email || !password || !phone || !username) {
      return Response.json(
        {
          error:
            "Full name, username, email, phone, country, and password are required",
        },
        { status: 400 },
      );
    }

    const normalizedUsername = String(username).toLowerCase().trim();

    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      return Response.json(
        {
          error:
            "Username must be 3–30 characters using only letters, numbers, or underscores.",
        },
        { status: 400 },
      );
    }

    if (!isAcceptablePassword(password)) {
      return Response.json(
        {
          error:
            "Use a Fair or Good password with at least 8 characters and either mixed-case letters or a number or symbol.",
        },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone, country);

    if (!normalizedPhone) {
      return Response.json(
        {
          error:
            "Enter a valid phone number that matches the selected country.",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const [existingUser, usernameOwner] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username: normalizedUsername }),
    ]);

    if (
      usernameOwner &&
      String(usernameOwner._id) !== String(existingUser?._id)
    ) {
      return Response.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }

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
    user.phone = normalizedPhone;
    user.username = normalizedUsername;

    await user.save();

    try {
      await notifySmartsuppSignup(user);
    } catch (error) {
      console.error("Smartsupp signup notification failed:", error);
    }

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
            "Registration successful. Email verification is not configured, so your account was verified automatically.",
        },
        { status: 201 },
      );
    }

    return Response.json(
      { message: "Registration successful. Please verify your email." },
      { status: 201 },
    );
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.username) {
      return Response.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }

    return serverError(error);
  }
}
