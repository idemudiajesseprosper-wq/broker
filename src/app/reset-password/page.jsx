"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ErrorMessage,
  GoldButton,
  PasswordField,
  Spinner,
} from "@/components/AuthControls";
import AuthShell from "@/components/AuthShell";
import { useToast } from "@/context/ToastContext";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError("");

    if (!token) {
      setError("Reset token is missing");
      toast.error(
        "Reset token is missing",
        "Open the latest reset link again.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match", "Please confirm both passwords.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        body: JSON.stringify({ newPassword: password, token }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to reset password",
        );
      }

      setSuccess(true);
      toast.success("Password updated", "You can now sign in.");
    } catch (submitError) {
      setError(submitError.message);
      toast.error("Unable to reset password", submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return success ? (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.1)] text-2xl text-[#F5A623]">
        ✓
      </div>
      <h2
        className="mt-5 text-xl font-bold text-white"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        Password updated. Sign in now.
      </h2>
      <Link
        className="mt-6 inline-flex text-sm font-medium text-[#F5A623]"
        href="/login"
      >
        Sign in
      </Link>
    </div>
  ) : (
    <div className="space-y-5">
      <PasswordField
        label="New password"
        onChange={setPassword}
        placeholder="Enter new password"
        show={showPassword}
        toggleShow={() => setShowPassword((value) => !value)}
        value={password}
      />
      <PasswordField
        label="Confirm password"
        onChange={setConfirmPassword}
        placeholder="Confirm new password"
        show={showConfirmPassword}
        toggleShow={() => setShowConfirmPassword((value) => !value)}
        value={confirmPassword}
      />
      <GoldButton disabled={loading} onClick={handleSubmit}>
        {loading ? <Spinner /> : null}
        {loading ? "Updating..." : "Update password"}
      </GoldButton>
      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell subtitle="Choose a new secure password" title="Reset password">
      <Suspense fallback={null}>
        <ResetPasswordContent />
      </Suspense>
    </AuthShell>
  );
}
