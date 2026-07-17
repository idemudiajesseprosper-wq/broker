"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, user } = useAuth();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && !loading && !user) {
      router.push("/admin/login");
    }

    if (!isLoginPage && !loading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isLoginPage, loading, router, user]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !user || user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
