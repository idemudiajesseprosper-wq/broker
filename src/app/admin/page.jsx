"use client";

import {
  Activity,
  Bell,
  CircleDollarSign,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";
import LogoutButton from "@/components/LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { ACCOUNT_PLANS, DEFAULT_ACCOUNT_PLAN } from "@/utils/accountPlans";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});
const USERS_PER_MONEY_PAGE = 10;

const tabs = [
  ["overview", LayoutDashboard, "Overview"],
  ["users", Users, "Users"],
  ["money", CircleDollarSign, "Manage Accounts"],
  ["transactions", Wallet, "Transactions"],
  ["notifications", Bell, "Notifications"],
  ["reports", Activity, "Reports"],
  ["audit", ShieldCheck, "Audit"],
  ["settings", KeyRound, "Settings"],
];

const moneySchema = z.object({
  action: z.enum([
    "deposit",
    "withdraw",
    "set_withdrawn",
    "bonus",
    "balance_credit",
    "balance_debit",
  ]),
  amount: z.coerce.number().nonnegative(),
  bonusType: z.string().optional(),
  reason: z.string().min(2),
  userId: z.string().min(1),
});

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function labelUser(user) {
  return user?.fullName || user?.email || "Unknown user";
}

function ConfirmationModal({ confirmation, loading, onCancel, onConfirm }) {
  if (!confirmation) {
    return null;
  }

  const { action, user } = confirmation;
  const isDelete = action === "delete";
  const actionLabel = isDelete ? "Delete user" : `${action} user`;

  return (
    <div
      aria-labelledby="confirmation-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#11130f] shadow-2xl shadow-black/60">
        <div className="h-1 bg-gradient-to-r from-[#ff6464] via-[#f5a623] to-[#d7ff45]" />
        <div className="p-6 sm:p-7">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#ff6464]/15 text-[#ff7777]">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-bold text-white" id="confirmation-title">
            Confirm account action
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Are you sure you want to {action} {labelUser(user)}?
            {isDelete
              ? " This will disable their account and remove them from the active user list."
              : " Their access will be updated immediately."}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button disabled={loading} onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button
              className="min-w-32"
              disabled={loading}
              onClick={onConfirm}
              variant={isDelete || action === "suspend" ? "danger" : "default"}
            >
              {loading ? "Processing..." : actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminShell({ children, darkMode, setDarkMode, active, setActive }) {
  return (
    <main
      className={
        darkMode
          ? "min-h-screen bg-[#08090b] text-white"
          : "min-h-screen bg-[#f4f7f2] text-[#171914]"
      }
    >
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-[#08090b] p-5 text-white lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d7ff45]">
            BSX Capital
          </p>
          <h1 className="mt-2 text-2xl font-bold">Admin Console</h1>
        </div>
        <nav className="space-y-1">
          {tabs.map(([key, Icon, label]) => (
            <button
              className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm transition ${
                active === key
                  ? "bg-[#d7ff45] text-[#11140c]"
                  : "text-white/68 hover:bg-white/10 hover:text-white"
              }`}
              key={key}
              onClick={() => setActive(key)}
              type="button"
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-black/10 bg-inherit/95 px-4 backdrop-blur md:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-55">
              Investment Management
            </p>
            <h2 className="text-lg font-semibold">Operations Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Toggle theme"
              className="h-10 w-10 p-0"
              onClick={() => setDarkMode((value) => !value)}
              variant="outline"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            <LogoutButton
              className="h-10 rounded-md border border-white/15 bg-white/5 px-4 text-sm font-semibold text-inherit transition hover:bg-white/10"
              redirectTo="/admin/login"
            >
              Sign out
            </LogoutButton>
          </div>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-black/10 px-4 py-3 lg:hidden">
          {tabs.map(([key, Icon, label]) => (
            <button
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm ${
                active === key ? "bg-[#11140c] text-white" : "bg-black/5"
              }`}
              key={key}
              onClick={() => setActive(key)}
              type="button"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="px-4 py-6 md:px-8">{children}</div>
      </section>
    </main>
  );
}

export default function AdminPage() {
  const toast = useToast();
  const [active, setActive] = useState("overview");
  const [darkMode, setDarkMode] = useState(true);
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [moneyQuery, setMoneyQuery] = useState("");
  const [moneyPage, setMoneyPage] = useState(1);
  const [accountActions, setAccountActions] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const notificationForm = useForm({
    defaultValues: { message: "", target: "all", title: "" },
  });

  const load = useCallback(
    async function load() {
      const response = await fetch("/api/admin/overview");
      if (response.ok) {
        setData(await response.json());
        return;
      }

      toast.error(
        "Unable to load admin data",
        "Refresh the page and try again.",
      );
    },
    [toast],
  );

  useEffect(() => {
    load();
  }, [load]);

  const users = useMemo(() => {
    const items = data?.users || [];
    return items.filter((user) => {
      const search =
        `${user.fullName} ${user.email} ${user.username}`.toLowerCase();
      return (
        (!query || search.includes(query.toLowerCase())) &&
        (!status || user.status === status)
      );
    });
  }, [data, query, status]);

  const moneyUsers = useMemo(() => {
    const items = data?.users || [];
    return items.filter((user) => {
      const search =
        `${user.fullName} ${user.email} ${user.username}`.toLowerCase();
      return !moneyQuery || search.includes(moneyQuery.toLowerCase());
    });
  }, [data, moneyQuery]);

  const totalMoneyPages = Math.max(
    1,
    Math.ceil(moneyUsers.length / USERS_PER_MONEY_PAGE),
  );
  const paginatedMoneyUsers = moneyUsers.slice(
    (moneyPage - 1) * USERS_PER_MONEY_PAGE,
    moneyPage * USERS_PER_MONEY_PAGE,
  );

  useEffect(() => {
    setMoneyPage((page) => Math.min(page, totalMoneyPages));
  }, [totalMoneyPages]);

  async function mutate(url, options, success) {
    setMessage("");
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = payload.error || "Action failed";
      setMessage(error);
      toast.error("Action failed", error);
      return false;
    }

    setMessage(success);
    toast.success(success, "Admin data has been updated.");
    await load();
    return true;
  }

  function confirmStatusChange(user) {
    const isSuspending = user.status !== "suspended";
    setConfirmation({
      action: isSuspending ? "suspend" : "activate",
      user,
    });
  }

  function confirmDeleteUser(user) {
    setConfirmation({ action: "delete", user });
  }

  async function executeConfirmedAction() {
    if (!confirmation) {
      return;
    }

    const { action, user } = confirmation;
    setConfirmationLoading(true);

    let saved;

    if (action === "delete") {
      saved = await mutate(
        `/api/admin/users/${user._id}`,
        { method: "DELETE" },
        "User deleted",
      );
    } else {
      saved = await mutate(
        `/api/admin/users/${user._id}`,
        {
          body: JSON.stringify({
            status: action === "suspend" ? "suspended" : "active",
          }),
          method: "PATCH",
        },
        `User ${action === "suspend" ? "suspended" : "activated"}`,
      );
    }

    setConfirmationLoading(false);

    if (saved) {
      setConfirmation(null);
    }
  }

  function exportCsv() {
    const rows = [
      ["Transaction ID", "User", "Type", "Amount", "Status", "Date"],
      ...(data?.transactions || []).map((item) => [
        item._id,
        labelUser(item.userId),
        item.type,
        item.amount,
        item.status,
        formatDate(item.createdAt),
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", "Transaction report downloaded.");
  }

  async function submitMoneyAction(values) {
    const parsed = moneySchema.safeParse(values);
    if (!parsed.success) {
      const error =
        "Select a user, choose deposit, withdrawal, add balance, remove balance, or bonus, enter an amount, and add a note";
      setMessage(error);
      toast.error("Account update not saved", error);
      return;
    }

    const labels = {
      bonus: "Bonus updated",
      balance_credit: "Balance updated",
      balance_debit: "Balance updated",
      deposit: "Deposit updated",
      withdraw: "Withdrawal updated",
      set_withdrawn: "Withdrawal total updated",
    };

    const saved = await mutate(
      "/api/admin/money",
      {
        body: JSON.stringify({
          action: parsed.data.action,
          amount: parsed.data.amount,
          bonusType: parsed.data.bonusType,
          note: parsed.data.reason,
          userId: parsed.data.userId,
        }),
        method: "POST",
      },
      labels[parsed.data.action],
    );

    if (saved) {
      setAccountActions((current) => ({
        ...current,
        [parsed.data.userId]: {
          action: parsed.data.action,
          amount: "",
          bonusType: "Admin bonus",
          reason: "",
        },
      }));
    }
  }

  function updateAccountAction(userId, patch) {
    setAccountActions((current) => ({
      ...current,
      [userId]: {
        action: "deposit",
        amount: "",
        bonusType: "Admin bonus",
        reason: "",
        ...(current[userId] || {}),
        ...patch,
      },
    }));
  }

  function updateMoneySearch(value) {
    setMoneyQuery(value);
    setMoneyPage(1);
  }

  async function submitAccountRow(user) {
    const values = {
      action: "deposit",
      amount: "",
      bonusType: "Admin bonus",
      reason: "",
      ...(accountActions[user._id] || {}),
      userId: user._id,
    };

    await submitMoneyAction(values);
  }

  async function changeAccountPlan(user, accountPlan) {
    await mutate(
      `/api/admin/users/${user._id}`,
      {
        body: JSON.stringify({ accountPlan }),
        method: "PATCH",
      },
      `Account upgraded to ${accountPlan}`,
    );
  }

  async function sendNotification(values) {
    await mutate(
      "/api/admin/notifications",
      {
        body: JSON.stringify({
          ...values,
          type: "system",
          userIds: selectedUser ? [selectedUser] : [],
        }),
        method: "POST",
      },
      "Notification sent",
    );
    notificationForm.reset({ message: "", target: "all", title: "" });
  }

  async function processTransaction(transaction, action) {
    await mutate(
      `/api/admin/transactions/${transaction._id}/process`,
      {
        body: JSON.stringify({
          action,
          note:
            action === "approve" ? "Approved by admin" : "Rejected by admin",
        }),
        method: "PUT",
      },
      `Transaction ${action === "approve" ? "approved" : "rejected"}`,
    );
  }

  async function changeAdminPassword(event) {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Password not changed", "New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    const response = await fetch("/api/admin/change-password", {
      body: JSON.stringify(passwordForm),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    const payload = await response.json().catch(() => ({}));
    setPasswordLoading(false);

    if (!response.ok) {
      toast.error(
        "Password not changed",
        payload.error || "Check your password and try again.",
      );
      return;
    }

    setPasswordForm({
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    });
    toast.success(
      "Password changed",
      "Use the new password next time you sign in.",
    );
  }

  if (!data) {
    return (
      <AdminShell
        active={active}
        darkMode={darkMode}
        setActive={setActive}
        setDarkMode={setDarkMode}
      >
        <div className="grid gap-4 md:grid-cols-4">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((key) => (
            <div
              className="h-28 animate-pulse rounded-lg bg-white/10"
              key={key}
            />
          ))}
        </div>
      </AdminShell>
    );
  }

  const metricCards = [
    ["Total Users", data.metrics.totalUsers, Users],
    ["Active Users", data.metrics.activeUsers, UserCheck],
    ["Pending Deposits", data.metrics.pendingDeposits, CircleDollarSign],
    ["Pending Withdrawals", data.metrics.pendingWithdrawals, Wallet],
    [
      "Total Deposits",
      money.format(data.metrics.totalDeposits),
      CircleDollarSign,
    ],
    ["Total Withdrawals", money.format(data.metrics.totalWithdrawals), Wallet],
    ["Total Bonuses Added", money.format(data.metrics.totalBonuses), Plus],
    ["Total User Balances", money.format(data.metrics.totalBalances), Activity],
  ];

  return (
    <AdminShell
      active={active}
      darkMode={darkMode}
      setActive={setActive}
      setDarkMode={setDarkMode}
    >
      <ConfirmationModal
        confirmation={confirmation}
        loading={confirmationLoading}
        onCancel={() => setConfirmation(null)}
        onConfirm={executeConfirmedAction}
      />
      {message ? (
        <div className="mb-4 rounded-md border border-[#d7ff45]/30 bg-[#d7ff45]/10 px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      {active === "overview" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map(([label, value, Icon]) => (
              <Card key={label}>
                <div className="flex items-center justify-between">
                  <p className="text-sm opacity-60">{label}</p>
                  <Icon className="text-[#d7ff45]" size={18} />
                </div>
                <p className="mt-4 text-2xl font-bold">{value}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard data={data.charts.deposits} title="Monthly Deposits" />
            <ChartCard
              data={data.charts.withdrawals}
              title="Monthly Withdrawals"
              type="bar"
            />
            <ChartCard data={data.charts.newUsers} title="New Users" />
            <ChartCard
              data={data.charts.bonuses}
              title="Bonus Distribution"
              type="bar"
            />
          </div>
          <Card>
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <ActivityList items={data.recentActivity} />
          </Card>
        </div>
      ) : null}

      {active === "users" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 opacity-45" size={16} />
              <Input
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users"
                value={query}
              />
            </div>
            <Select
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase opacity-55">
                <tr>
                  {[
                    "Profile",
                    "Full Name",
                    "Username",
                    "Email",
                    "Password",
                    "Phone",
                    "Country",
                    "Balance",
                    "Account Plan",
                    "Status",
                    "Registration",
                    "Actions",
                  ].map((head) => (
                    <th className="px-3 py-3" key={head}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const account = data.accounts.find(
                    (item) =>
                      item.userId?._id === user._id || item.userId === user._id,
                  );
                  return (
                    <tr className="border-b border-white/5" key={user._id}>
                      <td className="px-3 py-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#d7ff45] font-bold text-[#11140c]">
                          {user.fullName?.charAt(0) || "U"}
                        </div>
                      </td>
                      <td className="px-3 py-3">{user.fullName}</td>
                      <td className="px-3 py-3">{user.username || "—"}</td>
                      <td className="px-3 py-3">{user.email}</td>
                      <td className="px-3 py-3">{user.password}</td>
                      <td className="px-3 py-3">{user.phone}</td>
                      <td className="px-3 py-3">{user.country || "—"}</td>
                      <td className="px-3 py-3">
                        {money.format(account?.balance || 0)}
                      </td>
                      <td className="px-3 py-3">
                        <Select
                          disabled={user.role === "admin"}
                          onChange={(event) =>
                            changeAccountPlan(user, event.target.value)
                          }
                          value={account?.accountPlan || DEFAULT_ACCOUNT_PLAN}
                        >
                          {ACCOUNT_PLANS.map((plan) => (
                            <option key={plan} value={plan}>
                              {plan}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={user.status}>{user.status}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="space-x-2 px-3 py-3">
                        <Button
                          onClick={() => setSelectedUser(user._id)}
                          variant="outline"
                        >
                          View
                        </Button>
                        <Button
                          disabled={user.role === "admin"}
                          onClick={() => confirmStatusChange(user)}
                          variant="outline"
                        >
                          {user.status === "suspended" ? "Activate" : "Suspend"}
                        </Button>
                        <Button
                          disabled={user.role === "admin"}
                          onClick={() => confirmDeleteUser(user)}
                          variant="danger"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      ) : null}

      {active === "money" ? (
        <div className="grid gap-4">
          <ManageAccountsTable
            accounts={data.accounts}
            actions={accountActions}
            currentPage={moneyPage}
            onPageChange={setMoneyPage}
            onSearch={updateMoneySearch}
            onSubmit={submitAccountRow}
            onUpdateAction={updateAccountAction}
            query={moneyQuery}
            totalPages={totalMoneyPages}
            totalUsers={moneyUsers.length}
            users={paginatedMoneyUsers}
          />
          <MoneyTable title="Deposits" rows={data.deposits} />
          <MoneyTable title="Withdrawals" rows={data.withdrawals} withdrawal />
          <BonusTable rows={data.bonuses} />
        </div>
      ) : null}

      {active === "transactions" ? (
        <Card className="overflow-x-auto">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Unified Transactions</h3>
            <Button onClick={exportCsv} variant="outline">
              <Download size={16} /> Export CSV
            </Button>
          </div>
          <TransactionTable
            onProcess={processTransaction}
            rows={data.transactions}
          />
        </Card>
      ) : null}

      {active === "notifications" ? (
        <Card className="max-w-2xl">
          <h3 className="mb-4 text-lg font-semibold">Send Notification</h3>
          <form
            className="grid gap-3"
            onSubmit={notificationForm.handleSubmit(sendNotification)}
          >
            <Select {...notificationForm.register("target")}>
              <option value="all">Broadcast to All Users</option>
              <option value="single">Single User</option>
              <option value="multiple">Multiple Users</option>
            </Select>
            <Select
              onChange={(event) => setSelectedUser(event.target.value)}
              value={selectedUser}
            >
              <option value="">Select user for single/multiple</option>
              {data.users.map((user) => (
                <option key={user._id} value={user._id}>
                  {labelUser(user)}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Title"
              {...notificationForm.register("title")}
            />
            <Input
              placeholder="Message"
              {...notificationForm.register("message")}
            />
            <Button type="submit">
              <Bell size={16} /> Send
            </Button>
          </form>
        </Card>
      ) : null}

      {active === "reports" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard data={data.charts.deposits} title="Deposits Report" />
          <ChartCard
            data={data.charts.withdrawals}
            title="Withdrawals Report"
          />
          <ChartCard
            data={data.charts.newUsers}
            title="User Registrations"
            type="bar"
          />
          <ChartCard data={data.charts.bonuses} title="Bonuses Report" />
        </div>
      ) : null}

      {active === "audit" ? (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Audit Logs</h3>
          <ActivityList items={data.auditLogs} />
        </Card>
      ) : null}

      {active === "settings" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold">Site Settings</h3>
            <div className="grid gap-3">
              <Input
                defaultValue="BSX Capital Exchange"
                placeholder="Site name"
              />
              <Input placeholder="Site logo URL" />
              <Select defaultValue="off">
                <option value="off">Maintenance Mode Off</option>
                <option value="on">Maintenance Mode On</option>
              </Select>
              <Input placeholder="Email sender address" />
              <Button>Save Settings</Button>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Change admin password</h3>
            <p className="mb-4 mt-1 text-sm opacity-60">
              Confirm your current password before choosing a new one.
            </p>
            <form className="grid gap-3" onSubmit={changeAdminPassword}>
              {[
                {
                  autoComplete: "current-password",
                  field: "currentPassword",
                  placeholder: "Current password",
                },
                {
                  autoComplete: "new-password",
                  field: "newPassword",
                  placeholder: "New password",
                },
                {
                  autoComplete: "new-password",
                  field: "confirmPassword",
                  placeholder: "Confirm new password",
                },
              ].map(({ autoComplete, field, placeholder }) => {
                const isVisible = visiblePasswords[field];
                const VisibilityIcon = isVisible ? EyeOff : Eye;

                return (
                  <div className="relative" key={field}>
                    <Input
                      autoComplete={autoComplete}
                      className="pr-11"
                      minLength={field === "currentPassword" ? undefined : 8}
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                      placeholder={placeholder}
                      required
                      type={isVisible ? "text" : "password"}
                      value={passwordForm[field]}
                    />
                    <button
                      aria-label={
                        isVisible
                          ? `Hide ${placeholder.toLowerCase()}`
                          : `Show ${placeholder.toLowerCase()}`
                      }
                      className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7ff45]/60"
                      onClick={() =>
                        setVisiblePasswords((current) => ({
                          ...current,
                          [field]: !current[field],
                        }))
                      }
                      type="button"
                    >
                      <VisibilityIcon aria-hidden="true" size={17} />
                    </button>
                  </div>
                );
              })}
              <Button disabled={passwordLoading} type="submit">
                {passwordLoading ? "Changing password..." : "Change password"}
              </Button>
            </form>
          </Card>
        </div>
      ) : null}
    </AdminShell>
  );
}

function ChartCard({ data, title, type = "area" }) {
  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer height="100%" width="100%">
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.45)" />
              <YAxis stroke="rgba(255,255,255,0.45)" />
              <Tooltip />
              <Bar dataKey="total" fill="#d7ff45" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.45)" />
              <YAxis stroke="rgba(255,255,255,0.45)" />
              <Tooltip />
              <Area
                dataKey="total"
                fill="#d7ff45"
                fillOpacity={0.2}
                stroke="#d7ff45"
                type="monotone"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ManageAccountsTable({
  accounts,
  actions,
  currentPage,
  onPageChange,
  onSearch,
  onSubmit,
  onUpdateAction,
  query,
  totalPages,
  totalUsers,
  users,
}) {
  const toast = useToast();

  async function copyWithdrawalPin(pin) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pin);
      } else {
        const input = document.createElement("textarea");
        input.value = pin;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }

      toast.success("Withdrawal PIN copied", "The PIN is on your clipboard.");
    } catch {
      toast.error("Unable to copy PIN", "Press and hold the PIN to copy it.");
    }
  }

  return (
    <Card className="overflow-x-auto">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h3 className="text-lg font-semibold">Manage Accounts</h3>
          <p className="mt-1 text-sm opacity-60">
            Edit deposits, withdrawals, balances, and bonuses directly from the
            user list.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 opacity-45" size={16} />
          <Input
            className="pl-9"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search users"
            value={query}
          />
        </div>
      </div>

      <table className="w-full min-w-[1450px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase opacity-55">
          <tr>
            {[
              "User",
              "Email",
              "Balance",
              "Deposited",
              "Withdrawn",
              "Bonus",
              "Withdrawal PIN",
              "Action",
              "Amount",
              "Note",
              "Save",
            ].map((head) => (
              <th className="px-3 py-3" key={head}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const account = accounts.find(
              (item) =>
                item.userId?._id === user._id || item.userId === user._id,
            );
            const action = {
              action: "deposit",
              amount: "",
              bonusType: "Admin bonus",
              reason: "",
              ...(actions[user._id] || {}),
            };
            return (
              <tr className="border-b border-white/5 align-top" key={user._id}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d7ff45] font-bold text-[#11140c]">
                      {labelUser(user).charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{labelUser(user)}</p>
                      <p className="text-xs opacity-45">
                        @{user.username || "user"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">{user.email || "Not provided"}</td>
                <td className="px-3 py-3 font-semibold">
                  {money.format(account?.balance || 0)}
                </td>
                <td className="px-3 py-3">
                  {money.format(account?.totalDeposited || 0)}
                </td>
                <td className="px-3 py-3">
                  {money.format(account?.totalWithdrawn || 0)}
                </td>
                <td className="px-3 py-3">
                  {money.format(account?.totalBonus || 0)}
                </td>
                <td className="px-3 py-3">
                  {account?.withdrawalPin ? (
                    <button
                      aria-label={`Copy withdrawal PIN ${account.withdrawalPin}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#d7ff45]/20 bg-[#d7ff45]/5 px-3 font-mono text-xs text-[#d7ff45] transition hover:bg-[#d7ff45]/10 active:scale-[0.98]"
                      onClick={() => copyWithdrawalPin(account.withdrawalPin)}
                      title="Copy withdrawal PIN"
                      type="button"
                    >
                      {account.withdrawalPin}
                      <Copy aria-hidden="true" size={14} />
                    </button>
                  ) : (
                    <span className="text-xs opacity-45">Generating...</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Select
                    className="h-10 min-w-36"
                    onChange={(event) =>
                      onUpdateAction(user._id, { action: event.target.value })
                    }
                    value={action.action}
                  >
                    <option value="deposit">Set deposit total</option>
                    <option value="withdraw">Set withdrawal total</option>
                    <option value="balance_credit">Set balance</option>
                    <option value="bonus">Set bonus total</option>
                  </Select>
                  {action.action === "bonus" ? (
                    <Input
                      className="mt-2 h-9 min-w-36"
                      onChange={(event) =>
                        onUpdateAction(user._id, {
                          bonusType: event.target.value,
                        })
                      }
                      placeholder="Bonus type"
                      value={action.bonusType}
                    />
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <Input
                    className="h-10 min-w-32"
                    min="0"
                    onChange={(event) =>
                      onUpdateAction(user._id, { amount: event.target.value })
                    }
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    value={action.amount}
                  />
                </td>
                <td className="px-3 py-3">
                  <Input
                    className="h-10 min-w-56"
                    onChange={(event) =>
                      onUpdateAction(user._id, { reason: event.target.value })
                    }
                    placeholder="Admin note"
                    value={action.reason}
                  />
                </td>
                <td className="px-3 py-3">
                  <Button
                    className="h-10 whitespace-nowrap px-3 text-xs"
                    onClick={() => onSubmit(user)}
                    type="button"
                  >
                    <Plus size={14} /> Save
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {users.length ? null : (
        <div className="py-10 text-center text-sm opacity-55">
          No users match your search.
        </div>
      )}

      <div className="mt-5 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 text-sm md:flex-row md:items-center">
        <p className="opacity-55">
          Showing page {currentPage} of {totalPages} · {totalUsers} user(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={currentPage <= 1}
            onClick={() => onPageChange((page) => Math.max(1, page - 1))}
            type="button"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            disabled={currentPage >= totalPages}
            onClick={() =>
              onPageChange((page) => Math.min(totalPages, page + 1))
            }
            type="button"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ActivityList({ items }) {
  return (
    <div className="divide-y divide-white/10">
      {items.map((item) => (
        <div
          className="flex items-center justify-between gap-4 py-3"
          key={item._id}
        >
          <div>
            <p className="font-medium">
              {item.action || item.type || item.title}
            </p>
            <p className="text-sm opacity-55">
              {labelUser(item.userId)}{" "}
              {item.amount ? `· ${money.format(item.amount)}` : ""}
            </p>
          </div>
          <span className="text-sm opacity-50">
            {formatDate(item.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}

function MoneyTable({ rows, title, withdrawal = false }) {
  return (
    <Card className="overflow-x-auto xl:col-span-2">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase opacity-55">
          <tr>
            {[
              "ID",
              "User",
              "Amount",
              withdrawal ? "Wallet / Bank" : "Payment Method",
              "Reference",
              "Status",
              "Created",
            ].map((head) => (
              <th className="px-3 py-3" key={head}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-white/5" key={row._id}>
              <td className="px-3 py-3">{row._id.slice(-8)}</td>
              <td className="px-3 py-3">{labelUser(row.userId)}</td>
              <td className="px-3 py-3">{money.format(row.amount || 0)}</td>
              <td className="px-3 py-3">
                {withdrawal
                  ? row.walletAddress || row.bankDetails?.bankName || "—"
                  : row.paymentMethod || "Manual"}
              </td>
              <td className="px-3 py-3">{row.transactionReference || "—"}</td>
              <td className="px-3 py-3">
                <Badge tone={row.status}>{row.status}</Badge>
              </td>
              <td className="px-3 py-3">{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function BonusTable({ rows }) {
  return (
    <Card className="overflow-x-auto xl:col-span-2">
      <h3 className="mb-4 text-lg font-semibold">Bonuses</h3>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase opacity-55">
          <tr>
            {["ID", "User", "Amount", "Bonus Type", "Reason", "Created"].map(
              (head) => (
                <th className="px-3 py-3" key={head}>
                  {head}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-white/5" key={row._id}>
              <td className="px-3 py-3">{row._id.slice(-8)}</td>
              <td className="px-3 py-3">{labelUser(row.userId)}</td>
              <td className="px-3 py-3">{money.format(row.amount || 0)}</td>
              <td className="px-3 py-3">{row.bonusType || "Admin bonus"}</td>
              <td className="px-3 py-3">{row.reason || "N/A"}</td>
              <td className="px-3 py-3">{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function TransactionTable({ onProcess, rows }) {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="border-b border-white/10 text-xs uppercase opacity-55">
        <tr>
          {[
            "Transaction ID",
            "User",
            "Type",
            "Amount",
            "Method",
            "Proof",
            "Status",
            "Date",
            "Actions",
          ].map((head) => (
            <th className="px-3 py-3" key={head}>
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr className="border-b border-white/5" key={row._id}>
            <td className="px-3 py-3">{row._id.slice(-8)}</td>
            <td className="px-3 py-3">{labelUser(row.userId)}</td>
            <td className="px-3 py-3 capitalize">{row.type}</td>
            <td className="px-3 py-3">{money.format(row.amount || 0)}</td>
            <td className="px-3 py-3">
              {row.paymentMethod || row.withdrawalMethod || "Bank transfer"}
            </td>
            <td className="px-3 py-3">
              {row.paymentProof ? (
                <a
                  className="font-semibold text-[#d7ff45] underline-offset-4 hover:underline"
                  href={row.paymentProof}
                  rel="noreferrer"
                  target="_blank"
                >
                  View
                </a>
              ) : (
                "N/A"
              )}
            </td>
            <td className="px-3 py-3">
              <Badge tone={row.status}>{row.status}</Badge>
            </td>
            <td className="px-3 py-3">{formatDate(row.createdAt)}</td>
            <td className="px-3 py-3">
              {row.status === "pending" ? (
                <div className="flex gap-2">
                  <Button
                    className="h-8 px-3 text-xs"
                    onClick={() => onProcess(row, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    className="h-8 px-3 text-xs"
                    onClick={() => onProcess(row, "reject")}
                    variant="danger"
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <span className="text-xs opacity-45">Processed</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
