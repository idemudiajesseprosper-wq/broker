"use client";

import { BellRing, CheckCheck, Inbox, MailOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DashboardCard,
  EmptyState,
  formatDate,
  LoadingState,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/DashboardPageKit";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";

const notificationTypes = {
  deposit: "Deposit",
  investment: "Investment",
  kyc: "KYC",
  system: "System",
  withdrawal: "Withdrawal",
};

export default function NotificationsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );
  const latestNotification = notifications[0];

  const loadNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load notifications");
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      toast.error("Notifications unavailable", error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadNotifications();
    const refreshTimer = window.setInterval(loadNotifications, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [loadNotifications]);

  async function markRead(id) {
    setUpdating(id);

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update notification");
      }

      setNotifications((items) =>
        items.map((item) =>
          item._id === id ? { ...item, isRead: true } : item,
        ),
      );
      toast.success("Notification updated", "Marked as read.");
    } catch (error) {
      toast.error("Update failed", error.message);
    } finally {
      setUpdating("");
    }
  }

  async function markAllRead() {
    setUpdating("all");

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update notifications");
      }

      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true })),
      );
      toast.success("Inbox cleared", data.message);
    } catch (error) {
      toast.error("Update failed", error.message);
    } finally {
      setUpdating("");
    }
  }

  if (loading) {
    return <LoadingState label="Loading notifications..." />;
  }

  return (
    <div>
      <PageHeader
        description="Stay current on deposits, withdrawals, investments, KYC reviews, and system updates."
        title="Notifications"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          accent="#F5A623"
          icon={BellRing}
          label="Unread"
          value={unreadCount}
        />
        <StatCard
          accent="#60A5FA"
          detail="All account alerts"
          icon={Inbox}
          label="Total"
          value={notifications.length}
        />
        <StatCard
          accent="#4ADE80"
          detail={
            latestNotification
              ? formatDate(latestNotification.createdAt)
              : "No activity yet"
          }
          icon={MailOpen}
          label="Latest Alert"
          value={latestNotification?.type || "none"}
        />
      </div>

      <DashboardCard className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Inbox</h2>
            <p className="mt-1 text-sm text-white/42">
              Unread alerts are shown first.
            </p>
          </div>
          <Button
            className="bg-[#F5A623] text-[#050508] hover:bg-[#E8C84A]"
            disabled={!unreadCount || updating === "all"}
            onClick={markAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            {updating === "all" ? "Updating..." : "Mark all read"}
          </Button>
        </div>

        {notifications.length ? (
          <div className="mt-5 space-y-3">
            {notifications.map((notification) => (
              <article
                className={`rounded-[10px] border p-4 transition ${
                  notification.isRead
                    ? "border-white/8 bg-black/15"
                    : "border-[#F5A623]/28 bg-[#F5A623]/10"
                }`}
                key={notification._id}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-white">
                        {notification.title || "Account update"}
                      </h3>
                      <StatusBadge
                        status={notification.isRead ? "completed" : "pending"}
                      />
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-white/45">
                        {notificationTypes[notification.type] ||
                          notification.type ||
                          "Alert"}
                      </span>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/50">
                      {notification.message || "No message provided."}
                    </p>
                    <p className="mt-3 text-xs text-white/35">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead ? (
                    <Button
                      className="shrink-0"
                      disabled={updating === notification._id}
                      onClick={() => markRead(notification._id)}
                      variant="outline"
                    >
                      {updating === notification._id
                        ? "Updating..."
                        : "Mark read"}
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              description="Important investment, funding, KYC, and account updates will appear here."
              title="No notifications yet"
            />
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
