"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { getAIBriefing, type AIBriefing } from "@/actions/ai-features";
import { useBalanceVisibility } from "./BalanceVisibility";
import Link from "next/link";
import { formatCurrency } from "@/lib/currencies";

export default function AIMonthlyBriefing() {
  const [data, setData] = useState<AIBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hidden } = useBalanceVisibility();

  useEffect(() => {
    getAIBriefing().then((res) => {
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
      <div className="glass rounded-xl p-5 shimmer">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-accent animate-spin" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            <div className="h-2 w-48 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const incomeTrend = data.incomeChange > 0;
  const expenseTrend = data.expenseChange > 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Monthly Briefing</h3>
            <p className="text-[10px] text-muted-foreground">Powered by AI analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Income</p>
            <div className="flex items-center gap-1.5">
              {hidden ? (
                <span className="text-lg font-bold text-foreground">•••</span>
              ) : (
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(data.incomeAmount, "INR")}
                </span>
              )}
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                incomeTrend ? "bg-primary/10 text-primary" : data.incomeChange < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
              }`}>
                {incomeTrend ? <TrendingUp className="h-2.5 w-2.5" /> : data.incomeChange < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                {data.incomeChange > 0 ? "+" : ""}{data.incomeChange}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Expenses</p>
            <div className="flex items-center gap-1.5">
              {hidden ? (
                <span className="text-lg font-bold text-foreground">•••</span>
              ) : (
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(data.expenseAmount, "INR")}
                </span>
              )}
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                expenseTrend ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              }`}>
                {expenseTrend ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {data.expenseChange > 0 ? "+" : ""}{data.expenseChange}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Net</p>
            <div className="flex items-center gap-1.5">
              {hidden ? (
                <span className="text-lg font-bold text-foreground">•••</span>
              ) : (
                <span className={`text-lg font-bold ${data.netAmount >= 0 ? "text-primary" : "text-destructive"}`}>
                  {data.netAmount >= 0 ? "+" : "-"}{formatCurrency(Math.abs(data.netAmount), "INR")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 border border-border/50 mb-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Insight: </span>
            {data.topInsight}
          </p>
        </div>

        <Link
          href="/briefing"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View Full Briefing
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
