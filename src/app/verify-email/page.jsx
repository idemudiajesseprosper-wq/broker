"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Spinner } from "@/components/AuthControls";
import AuthShell from "@/components/AuthShell";
import { useToast } from "@/context/ToastContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const showError = toast.error;
  const showSuccess = toast.success;
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setMessage("Link expired or invalid. Request a new one.");
        showError("Invalid verification link", "Request a fresh link.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Unable to verify email",
          );
        }

        setStatus("success");
        setMessage("Email verified! You can now sign in.");
        showSuccess("Email verified", "You can now sign in.");
      } catch {
        setStatus("error");
        setMessage("Link expired or invalid. Request a new one.");
        showError("Unable to verify email", "Request a fresh link.");
      }
    }

    verifyEmail();
  }, [showError, showSuccess, token]);

  return (
    <div className="text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border text-2xl ${
          status === "error"
            ? "border-[rgba(229,57,53,0.45)] bg-[rgba(229,57,53,0.1)] text-[#E53935]"
            : "border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.1)] text-[#F5A623]"
        }`}
      >
        {status === "loading" ? <Spinner /> : status === "success" ? "✓" : "X"}
      </div>
      <h2
        className="mt-6 text-xl font-bold text-white"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        {message}
      </h2>
      <Link
        className="mt-6 inline-flex text-sm font-medium text-[#F5A623]"
        href={status === "error" ? "/forgot-password" : "/login"}
      >
        {status === "error" ? "Request a new one" : "Sign in"}
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell
      subtitle="Secure account activation for BSX Capital Exchange"
      title="Email verification"
    >
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
