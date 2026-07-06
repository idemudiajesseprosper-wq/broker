"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ErrorMessage,
  GoldButton,
  PasswordField,
  SelectField,
  Spinner,
  TextField,
} from "@/components/AuthControls";
import AuthShell from "@/components/AuthShell";
import { useToast } from "@/context/ToastContext";

const countries = [
  "Nigeria",
  "United States",
  "United Kingdom",
  "Canada",
  "Ghana",
  "South Africa",
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Cameroon",
  "Ivory Coast",
  "Senegal",
  "Egypt",
  "Morocco",
  "United Arab Emirates",
  "Saudi Arabia",
  "India",
  "Pakistan",
  "Bangladesh",
  "Philippines",
  "Malaysia",
  "Singapore",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Brazil",
  "Mexico",
  "Argentina",
  "Other",
];

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { color: "#E53935", label: "Weak", width: "33%" };
  if (score === 2) return { color: "#F5A623", label: "Fair", width: "66%" };
  return { color: "#4CAF50", label: "Strong", width: "100%" };
}

export default function RegisterPage() {
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "We sent a verification link to your inbox. Open it to activate your trading account.",
  );
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit() {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match", "Please confirm both passwords.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        body: JSON.stringify({ country, email, fullName, password, phone }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to create account",
        );
      }

      setSuccess(true);
      setSuccessMessage(data.message || successMessage);
      toast.success("Account created", data.message || successMessage);
    } catch (submitError) {
      setError(submitError.message);
      toast.error("Unable to create account", submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      maxWidth="max-w-[460px]"
      showNav
      stickyNav
      subtitle="Create your BSX Capital Exchange account"
      title="Start investing"
    >
      {success ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.1)] text-2xl text-[#F5A623]">
            ✓
          </div>
          <h2
            className="mt-5 text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Check your email to verify your account
          </h2>
          <p className="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.45)]">
            {successMessage}
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
            label="Full name"
            onChange={setFullName}
            placeholder="Your full name"
            value={fullName}
          />
          <TextField
            autoComplete="email"
            label="Email address"
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
          <TextField
            autoComplete="tel"
            label="Phone number"
            onChange={setPhone}
            placeholder="+1 (555) 123-4567"
            type="tel"
            value={phone}
          />
          <SelectField label="Country" onChange={setCountry} value={country}>
            <option value="">Select your country</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
          <div>
            <PasswordField
              label="Password"
              onChange={setPassword}
              placeholder="Create a password"
              show={showPassword}
              toggleShow={() => setShowPassword((value) => !value)}
              value={password}
            />
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    background: strength.color,
                    width: password ? strength.width : "0%",
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[rgba(255,255,255,0.4)]">
                Password strength: {password ? strength.label : "None"}
              </p>
            </div>
          </div>
          <PasswordField
            label="Confirm password"
            onChange={setConfirmPassword}
            placeholder="Confirm your password"
            show={showConfirmPassword}
            toggleShow={() => setShowConfirmPassword((value) => !value)}
            value={confirmPassword}
          />
          <GoldButton disabled={loading} onClick={handleSubmit}>
            {loading ? <Spinner /> : null}
            {loading ? "Creating account..." : "Create account"}
          </GoldButton>
          <ErrorMessage>{error}</ErrorMessage>
          <p className="text-center text-sm text-[rgba(255,255,255,0.45)]">
            Already have an account?{" "}
            <Link className="font-medium text-[#F5A623]" href="/login">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
