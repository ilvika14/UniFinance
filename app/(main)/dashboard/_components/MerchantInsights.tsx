"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  Receipt,
  Tag,
  ChevronDown,
  ChevronUp,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currencies";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: string | Date;
  description?: string | null;
  category?: string | null;
  isRecurring?: boolean;
  recurringInterval?: string | null;
};

interface Props {
  transactions: Transaction[];
  currency?: string;
}

const MERCHANT_KEYWORDS: Record<string, string[]> = {
  Netflix: ["netflix"],
  Spotify: ["spotify"],
  "Apple Store": ["apple", "itunes"],
  AWS: ["aws", "amazon web"],
  Amazon: ["amazon"],
  Uber: ["uber"],
  Lyft: ["lyft"],
  Google: ["google"],
  Adobe: ["adobe"],
  Microsoft: ["microsoft"],
  Shopify: ["shopify"],
  Slack: ["slack"],
  Zoom: ["zoom"],
  GitHub: ["github"],
  Figma: ["figma"],
  Notion: ["notion"],
  Dropbox: ["dropbox"],
  "Whole Foods": ["whole foods"],
  Starbucks: ["starbucks"],
  "Door Dash": ["doordash", "door dash"],
  "Target": ["target"],
  Walmart: ["walmart"],
};

const MERCHANT_COLORS: Record<string, string> = {
  Netflix: "bg-red-500",
  Spotify: "bg-green-500",
  "Apple Store": "bg-gray-800",
  AWS: "bg-orange-500",
  Amazon: "bg-yellow-500",
  Uber: "bg-black",
  Lyft: "bg-pink-500",
  Google: "bg-blue-500",
  Adobe: "bg-red-600",
  Microsoft: "bg-blue-600",
  Shopify: "bg-green-600",
  Slack: "bg-purple-500",
  Zoom: "bg-blue-400",
  GitHub: "bg-gray-900",
  Figma: "bg-purple-600",
  Notion: "bg-gray-700",
  Dropbox: "bg-blue-500",
  "Whole Foods": "bg-green-700",
  Starbucks: "bg-green-600",
  "Door Dash": "bg-red-500",
  Target: "bg-red-600",
  Walmart: "bg-blue-600",
};

function matchMerchant(desc: string): string {
  const lower = desc.toLowerCase();
  for (const [merchant, keywords] of Object.entries(MERCHANT_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return merchant;
  }
  return desc.length > 20 ? desc.substring(0, 20) : desc || "Other";
}

function MerchantIcon({ name }: { name: string }) {
  const bg = MERCHANT_COLORS[name] || "bg-muted";
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
    >
      {initial}
    </div>
  );
}

export default function MerchantInsights({ transactions, currency = "INR" }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [taxDeductible, setTaxDeductible] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState<Set<string>>(new Set());

  const merchantData = useMemo(() => {
    const map: Record<
      string,
      { total: number; count: number; transactions: Transaction[]; lastDate: string | Date }
    > = {};

    const expenses = transactions.filter((t) => t.type === "EXPENSE");
    for (const t of expenses) {
      const merchant = matchMerchant(t.description || t.category || "");
      if (!map[merchant]) {
        map[merchant] = { total: 0, count: 0, transactions: [], lastDate: t.date };
      }
      map[merchant].total += Number(t.amount);
      map[merchant].count += 1;
      map[merchant].transactions.push(t);
      if (new Date(t.date) > new Date(map[merchant].lastDate)) {
        map[merchant].lastDate = t.date;
      }
    }

    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [transactions]);

  const maxSpend = merchantData[0]?.total || 1;

  function toggleTaxDeductible(merchant: string) {
    setTaxDeductible((prev) => {
      const next = new Set(prev);
      if (next.has(merchant)) {
        next.delete(merchant);
        toast.success(`${merchant} unmarked as tax deductible`);
      } else {
        next.add(merchant);
        toast.success(`${merchant} marked as tax deductible`);
      }
      return next;
    });
  }

  function togglePause(merchant: string) {
    setPaused((prev) => {
      const next = new Set(prev);
      if (next.has(merchant)) {
        next.delete(merchant);
        toast.success(`Resumed ${merchant}`);
      } else {
        next.add(merchant);
        toast.success(`Paused ${merchant} subscription`);
      }
      return next;
    });
  }

  return (
    <div className="glass rounded-xl">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Merchant Insights
            </p>
            <h3 className="text-lg font-bold text-foreground">Top Spending</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Store className="h-3.5 w-3.5" />
            {merchantData.length} merchants
          </div>
        </div>

        {merchantData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No expense data yet</p>
        ) : (
          <div className="space-y-2">
            {merchantData.map((merchant) => {
              const isExpanded = expanded === merchant.name;
              const barWidth = (merchant.total / maxSpend) * 100;
              const isTaxDeductible = taxDeductible.has(merchant.name);
              const isPaused = paused.has(merchant.name);
              const lastTx = merchant.transactions[0];

              return (
                <div key={merchant.name} className="rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : merchant.name)}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/30 transition-colors text-left"
                  >
                    <MerchantIcon name={merchant.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {merchant.name}
                        </p>
                        {isPaused && (
                          <span className="text-[9px] font-bold bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded-md">
                            PAUSED
                          </span>
                        )}
                        {isTaxDeductible && (
                          <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                            TAX
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary/80 to-emerald-400/80 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {merchant.count}x
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground tabular-nums">
                        {formatCurrency(merchant.total, currency)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(merchant.lastDate), "MMM d")}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
                      <div className="flex gap-2">
                        {merchant.transactions[0]?.isRecurring && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePause(merchant.name);
                            }}
                            className={`h-7 text-[10px] font-semibold rounded-lg border-border gap-1 ${
                              isPaused ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600" : ""
                            }`}
                          >
                            <Pause className="h-3 w-3" />
                            {isPaused ? "Resume" : "Pause Subscription"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaxDeductible(merchant.name);
                          }}
                          className={`h-7 text-[10px] font-semibold rounded-lg border-border gap-1 ${
                            isTaxDeductible ? "bg-primary/10 border-primary/30 text-primary" : ""
                          }`}
                        >
                          <Tag className="h-3 w-3" />
                          {isTaxDeductible ? "Remove Tax Tag" : "Mark Tax Deductible"}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {merchant.transactions.slice(0, 3).map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowDownRight className="h-3 w-3 text-destructive" />
                              <span className="text-[11px] text-foreground">
                                {t.description || "Transaction"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(t.date), "MMM d")}
                              </span>
                              <span className="text-[11px] font-semibold text-destructive tabular-nums">
                                -{formatCurrency(Number(t.amount), currency)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
