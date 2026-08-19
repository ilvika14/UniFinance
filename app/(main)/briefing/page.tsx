"use client";

import { useEffect, useState } from "react";
import { getDetailedBriefing, type DetailedBriefing } from "@/actions/ai-features";
import { useBalanceVisibility } from "../dashboard/_components/BalanceVisibility";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Loader2,
  Wallet,
  PiggyBank,
  Repeat,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/currencies";

export default function BriefingPage() {
  const [data, setData] = useState<DetailedBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hidden } = useBalanceVisibility();

  useEffect(() => {
    getDetailedBriefing().then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load briefing");
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Analyzing your finances...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || "No data available"}</p>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { currentMonth, previousMonth, changes, categoryBreakdown, topExpenses, recurringTotal, recurringIncomeTotal, savingsRate, insights, healthScore, healthLabel, recommendations } = data;

  const formatBriefingCurrency = (v: number) =>
    hidden ? "•••" : formatCurrency(v, "INR");

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Monthly Briefing</h1>
            <p className="text-sm text-muted-foreground">{currentMonth.name} Financial Overview</p>
          </div>
        </div>

        {/* Health Score */}
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 p-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${(healthScore / 100) * 220} 220`}
                  strokeLinecap="round"
                  className={healthScore >= 70 ? "text-primary" : healthScore >= 40 ? "text-yellow-500" : "text-destructive"}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-foreground">{healthScore}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-lg font-bold text-foreground">Financial Health Score</span>
              </div>
              <p className={`text-sm font-semibold ${healthScore >= 70 ? "text-primary" : healthScore >= 40 ? "text-yellow-500" : "text-destructive"}`}>
                {healthLabel}
              </p>
              <p className="text-xs text-muted-foreground">Based on savings rate, spending trends, and income stability</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Income"
            amount={currentMonth.income}
            change={changes.incomePct}
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            color="primary"
            hidden={hidden}
          />
          <SummaryCard
            label="Expenses"
            amount={currentMonth.expenses}
            change={changes.expensePct}
            icon={<TrendingDown className="h-4 w-4 text-destructive" />}
            color="destructive"
            hidden={hidden}
            invertChange
          />
          <SummaryCard
            label="Net Savings"
            amount={currentMonth.net}
            change={changes.netPct}
            icon={<PiggyBank className={`h-4 w-4 ${currentMonth.net >= 0 ? "text-primary" : "text-destructive"}`} />}
            color={currentMonth.net >= 0 ? "primary" : "destructive"}
            hidden={hidden}
          />
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Savings Rate</p>
              <Wallet className="h-4 w-4 text-accent" />
            </div>
            <p className={`text-2xl font-bold tracking-tight ${savingsRate >= 20 ? "text-primary" : savingsRate >= 10 ? "text-yellow-500" : "text-destructive"}`}>
              {hidden ? "•••" : `${savingsRate}%`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{currentMonth.transactionCount} transactions</p>
          </div>
        </div>

        {/* Previous Month Comparison */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Month-over-Month Comparison</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">{previousMonth.name}</p>
              <p className="text-lg font-bold text-muted-foreground">{formatBriefingCurrency(previousMonth.income)}</p>
              <p className="text-[10px] text-muted-foreground">Income</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">{previousMonth.name}</p>
              <p className="text-lg font-bold text-muted-foreground">{formatBriefingCurrency(previousMonth.expenses)}</p>
              <p className="text-[10px] text-muted-foreground">Expenses</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">{previousMonth.name}</p>
              <p className={`text-lg font-bold ${previousMonth.net >= 0 ? "text-muted-foreground" : "text-destructive"}`}>
                {formatBriefingCurrency(Math.abs(previousMonth.net))}
              </p>
              <p className="text-[10px] text-muted-foreground">Net</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Spending by Category</h3>
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{cat.category}</span>
                      {cat.trend === "up" && <ArrowUpRight className="h-3 w-3 text-destructive" />}
                      {cat.trend === "down" && <ArrowDownRight className="h-3 w-3 text-primary" />}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{formatBriefingCurrency(cat.amount)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all"
                      style={{ width: `${Math.min(cat.pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right">{cat.pct.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Expenses */}
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Top 5 Expenses</h3>
            <div className="space-y-3">
              {topExpenses.map((exp, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">{exp.description}</p>
                    <p className="text-[10px] text-muted-foreground">{exp.category} · {exp.date}</p>
                  </div>
                  <span className="text-xs font-bold text-destructive">{formatBriefingCurrency(exp.amount)}</span>
                </div>
              ))}
              {topExpenses.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No expenses recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Recurring Expenses */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Repeat className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Recurring Expenses</h3>
              <p className="text-[10px] text-muted-foreground">Monthly subscription & recurring costs</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{formatBriefingCurrency(recurringTotal)}</span>
            <span className="text-xs text-muted-foreground">
              ({currentMonth.expenses > 0 ? ((recurringTotal / currentMonth.expenses) * 100).toFixed(1) : 0}% of total expenses)
            </span>
          </div>
        </div>

        {/* Recurring Income */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Recurring Income</h3>
              <p className="text-[10px] text-muted-foreground">Salary, freelance & recurring income streams</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{formatBriefingCurrency(recurringIncomeTotal)}</span>
            <span className="text-xs text-muted-foreground">
              ({currentMonth.income > 0 ? ((recurringIncomeTotal / currentMonth.income) * 100).toFixed(1) : 0}% of total income)
            </span>
          </div>
        </div>

        {/* AI Insights */}
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-bold text-foreground">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3 border border-border/50">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <h3 className="text-sm font-bold text-foreground">Recommendations</h3>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <span className="text-xs font-bold text-primary shrink-0">{i + 1}.</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  amount,
  change,
  icon,
  color,
  hidden,
  invertChange,
}: {
  label: string;
  amount: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  hidden: boolean;
  invertChange?: boolean;
}) {
  const isPositive = invertChange ? change < 0 : change > 0;
  const isNegative = invertChange ? change > 0 : change < 0;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${color === "primary" ? "text-primary" : "text-destructive"}`}>
        {hidden ? "•••" : formatCurrency(amount, "INR")}
      </p>
      {change !== 0 && (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-2 ${
          isPositive ? "bg-primary/10 text-primary" : isNegative ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        }`}>
          {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : isNegative ? <TrendingDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
          {change > 0 ? "+" : ""}{change}%
        </span>
      )}
    </div>
  );
}
