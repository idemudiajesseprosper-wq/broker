"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomTabBar from "@/components/dashboard/BottomTabBar";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { useAuth } from "@/context/AuthContext";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050508]">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[rgba(245,166,35,0.2)] border-t-[#F5A623]" />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-[#050508] text-white"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex flex-1 pt-[60px]">
        <Sidebar />
        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-[60] md:hidden">
            <button
              aria-label="Close navigation"
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
            />
            <div className="relative h-full w-[280px] border-r border-white/10">
              <Sidebar mobile onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        ) : null}
        <main className="flex-1 overflow-y-auto bg-[#050508] px-5 pb-24 pt-7 md:ml-[240px] md:px-8 md:pb-8">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}
