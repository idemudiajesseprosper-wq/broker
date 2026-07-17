"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { clearToken } from "@/utils/auth-client";

export default function LogoutButton({
  children,
  className,
  redirectTo = "/login",
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    toast.success("Signed out", "You have been logged out securely.");
    router.push(redirectTo);
  }

  return (
    <button
      className={className}
      disabled={loading}
      onClick={handleLogout}
      type="button"
    >
      {loading ? "Signing out..." : children || "Sign out"}
    </button>
  );
}
