"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ErrorMessage,
  GoldButton,
  Spinner,
  TextField,
} from "@/components/AuthControls";
import AuthShell from "@/components/AuthShell";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to send reset link",
        );
      }

      setSuccess(true);
      toast.success(
        "Reset link requested",
        "If that email exists, a reset link has been sent.",
      );
    } catch (submitError) {
      setError(submitError.message);
      toast.error("Unable to send reset link", submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      subtitle="Enter your email to receive a secure reset link"
      title="Reset password"
    >
      {success ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.1)] text-2xl text-[#F5A623]">
            ✓
          </div>
          <p className="mt-5 text-sm leading-6 text-[rgba(255,255,255,0.55)]">
            A reset link has been sent if that email exists.
          </p>
          <Link
            className="mt-6 inline-flex text-sm font-medium text-[#F5A623]"
            href="/login"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <TextField
            autoComplete="email"
            label="Email address"
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
          <GoldButton disabled={loading} onClick={handleSubmit}>
            {loading ? <Spinner /> : null}
            {loading ? "Sending link..." : "Send reset link"}
          </GoldButton>
          <ErrorMessage>{error}</ErrorMessage>
          <p className="text-center">
            <Link className="text-sm font-medium text-[#F5A623]" href="/login">
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
