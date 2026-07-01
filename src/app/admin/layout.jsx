"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/admin");
    }

    if (!loading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [loading, router, user]);

  if (loading || !user || user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
