"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ErrorMessage,
  GoldButton,
  PasswordField,
  Spinner,
  TextField,
} from "@/components/AuthControls";
import AuthShell from "@/components/AuthShell";
import { useToast } from "@/context/ToastContext";

function LoginContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to sign in");
      }

      const redirectTo =
        searchParams.get("redirect") ||
        (data.user?.role === "admin" ? "/admin" : "/dashboard");
      toast.success("Signed in", "Redirecting to your dashboard.");
      window.setTimeout(() => window.location.assign(redirectTo), 350);
    } catch (submitError) {
      setError(submitError.message);
      toast.error("Unable to sign in", submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      showNav
      stickyNav
      subtitle="Sign in to BSX Capital Exchange"
      title="Welcome back"
    >
      <div className="space-y-5">
        <TextField
          autoComplete="email"
          label="Email or username"
          onChange={setEmail}
          placeholder="admin or you@example.com"
          type="text"
          value={email}
        />
        <div>
          <PasswordField
            label="Password"
            onChange={setPassword}
            show={showPassword}
            toggleShow={() => setShowPassword((value) => !value)}
            value={password}
          />
          <div className="mt-2 text-right">
            <Link
              className="text-xs font-medium text-[#F5A623] transition hover:text-[#E8C84A]"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <GoldButton disabled={loading} onClick={handleSubmit}>
          {loading ? <Spinner /> : null}
          {loading ? "Signing in..." : "Sign in to dashboard"}
        </GoldButton>
        <ErrorMessage>{error}</ErrorMessage>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
          <span className="text-xs text-[rgba(255,255,255,0.35)]">or</span>
          <span className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
        </div>
        <p className="text-center text-sm text-[rgba(255,255,255,0.45)]">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-[#F5A623]" href="/register">
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
