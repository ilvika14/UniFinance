"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { getSubscriptionAudit, type SubscriptionItem } from "@/actions/ai-features";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currencies";

const MERCHANT_COLORS: Record<string, string> = {
  Netflix: "#E50914",
  Spotify: "#1DB954",
  AWS: "#FF9900",
  Adobe: "#FF0000",
  Figma: "#A259FF",
  GitHub: "#24292E",
  Google: "#4285F4",
  Microsoft: "#00A4EF",
  Zoom: "#2D8CFF",
  Slack: "#4A154B",
  Dropbox: "#0061FF",
  Notion: "#000000",
  "Apple Store": "#555555",
};

function MerchantLogo({ name }: { name: string }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ backgroundColor: MERCHANT_COLORS[name] || "#64748b" }}
    >
      {name.charAt(0)}
    </div>
  );
}

const statusConfig = {
  active: {
    label: "Active",
    bg: "bg-primary/10",
    color: "text-primary",
    dot: "bg-primary",
  },
  unused: {
    label: "Unused",
    bg: "bg-yellow-500/10",
    color: "text-yellow-600 dark:text-yellow-500",
    dot: "bg-yellow-500",
  },
  price_increased: {
    label: "Price Increased",
    bg: "bg-destructive/10",
    color: "text-destructive",
    dot: "bg-destructive",
  },
};

export default function SubscriptionAudit() {
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getSubscriptionAudit().then((res) => {
      if (res.success && res.data) {
        setItems(res.data);
      }
      setLoading(false);
    });
  }, []);

  const totalMonthly = items.reduce((sum, item) => {
    if (item.frequency === "Weekly") return sum + item.amount * 4.33;
    if (item.frequency === "Daily") return sum + item.amount * 30;
    if (item.frequency === "Yearly") return sum + item.amount / 12;
    return sum + item.amount;
  }, 0);

  if (loading) {
    return (
      <div className="glass rounded-xl">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-accent animate-spin" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-36 bg-muted rounded animate-pulse" />
              <div className="h-2 w-28 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-xl">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                Subscription Health
              </p>
              <h3 className="text-lg font-bold text-foreground">Subscriptions</h3>
            </div>
          </div>
          <p className="py-16 text-center text-sm text-muted-foreground">
            No recurring subscriptions detected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Subscription Health
            </p>
            <h3 className="text-lg font-bold text-foreground">Subscriptions</h3>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-foreground">{formatCurrency(totalMonthly, "INR")}/mo</p>
            <p className="text-[10px] text-muted-foreground">
              {items.length} active
              {items.filter((i) => i.status !== "active").length > 0 && (
                <span className="text-destructive ml-1">
                  · {items.filter((i) => i.status !== "active").length} issues
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const config = statusConfig[item.status];
            const isExpanded = expanded === item.merchant;

            return (
              <div
                key={item.merchant}
                className="rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.merchant)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <MerchantLogo name={item.merchant} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.merchant}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold ${config.bg} ${config.color} px-1.5 py-0.5 rounded-md`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                      {item.status === "unused" && item.daysSinceLastUsed !== null && (
                        <span className="text-[9px] text-muted-foreground">
                          {item.daysSinceLastUsed}d ago
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-foreground">
                        {formatCurrency(item.amount, "INR")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        /{item.frequency.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <RefreshCw className="h-2.5 w-2.5" />
                      {item.transactionCount}x
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground mb-0.5">Total Spent</p>
                        <p className="font-bold text-foreground">
                          {formatCurrency(item.totalSpent, "INR")}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground mb-0.5">Last Used</p>
                        <p className="font-bold text-foreground">
                          {item.lastUsed
                            ? new Date(item.lastUsed).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {item.status === "unused" && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <Clock className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <p className="text-[10px] text-yellow-700 dark:text-yellow-400">
                          This subscription hasn&apos;t been used in {item.daysSinceLastUsed} days.
                          Consider canceling to save {formatCurrency(item.amount, "INR")}/mo.
                        </p>
                      </div>
                    )}

                    {item.status === "price_increased" && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                        <p className="text-[10px] text-destructive">
                          Price has increased compared to your average. Review this subscription.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info(`Manage ${item.merchant} — open their website to cancel or modify`);
                      }}
                      className="w-full h-8 text-[10px] font-semibold rounded-lg border border-border hover:bg-muted/50 transition-colors text-foreground"
                    >
                      Cancel / Manage
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
