"use client";

import { useState } from "react";
import {
  ErrorMessage,
  GoldButton,
  PasswordField,
  Spinner,
  TextField,
} from "@/components/AuthControls";
import AuthShell from "@/components/AuthShell";
import { useToast } from "@/context/ToastContext";

export default function AdminLoginPage() {
  const toast = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin-login", {
        body: JSON.stringify({ email: identifier, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to sign in");
      }

      toast.success("Administrator signed in", "Opening the admin console.");
      window.setTimeout(() => window.location.assign("/admin"), 350);
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
      subtitle="Restricted administrator access"
      title="Admin sign in"
    >
      <div className="space-y-5">
        <TextField
          autoComplete="username"
          label="Admin email or username"
          onChange={setIdentifier}
          placeholder="Administrator"
          type="text"
          value={identifier}
        />
        <PasswordField
          label="Password"
          onChange={setPassword}
          show={showPassword}
          toggleShow={() => setShowPassword((value) => !value)}
          value={password}
        />
        <GoldButton disabled={loading} onClick={handleSubmit}>
          {loading ? <Spinner /> : null}
          {loading ? "Signing in..." : "Sign in to admin console"}
        </GoldButton>
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    </AuthShell>
  );
}
