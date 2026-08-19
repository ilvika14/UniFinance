"use client";

import { BalanceVisibilityProvider, BalanceToggle, SensitiveValue } from "./BalanceVisibility";
import { Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/currencies";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <BalanceVisibilityProvider>
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          {children}
        </div>
      </div>
    </BalanceVisibilityProvider>
  );
}

export function DashboardHeader({ totalBalance }: { totalBalance: number }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
      </div>
      <div className="flex items-center gap-3">
        <BalanceToggle />
        <a href="/transactions/create" className="inline-flex">
          <span className="gradient text-white rounded-xl gap-2 px-5 py-5 text-sm font-semibold inline-flex items-center">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Transaction
          </span>
        </a>
      </div>
    </div>
  );
}

export function DashboardStat({
  label,
  amount,
  icon,
  color = "text-foreground",
  currency = "INR",
}: {
  label: string;
  amount: number;
  icon: React.ReactNode;
  color?: string;
  currency?: string;
}) {
  const safeAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
  return (
    <div className="glass rounded-xl p-5 group hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
        {icon}
      </div>
      <SensitiveValue>
        <p className={`text-2xl font-bold ${color} tracking-tight`}>
          {formatCurrency(safeAmount, currency)}
        </p>
      </SensitiveValue>
    </div>
  );
}
