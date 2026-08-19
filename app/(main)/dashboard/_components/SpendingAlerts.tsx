"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  X,
  TrendingUp,
  Copy,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { detectSpendingAnomalies, type SpendingAlert } from "@/actions/ai-features";

export default function SpendingAlerts() {
  const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    detectSpendingAnomalies().then((res) => {
      if (res.success && res.data) {
        setAlerts(res.data);
      }
      setLoading(false);
    });
  }, []);

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  if (loading) {
    return (
      <div className="glass rounded-xl p-5 shimmer">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-3 w-40 bg-muted rounded animate-pulse" />
            <div className="h-2 w-56 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (visibleAlerts.length === 0) return null;

  const severityConfig = {
    high: { bg: "bg-destructive/5", border: "border-destructive/20", icon: AlertTriangle, color: "text-destructive" },
    medium: { bg: "bg-yellow-500/5", border: "border-yellow-500/20", icon: AlertCircle, color: "text-yellow-600 dark:text-yellow-500" },
    low: { bg: "bg-primary/5", border: "border-primary/20", icon: Zap, color: "text-primary" },
  };

  const typeConfig = {
    price_hike: { icon: TrendingUp, label: "Price Hike" },
    duplicate: { icon: Copy, label: "Duplicate" },
    unusual_activity: { icon: AlertCircle, label: "Unusual" },
  };

  return (
    <div className="rounded-xl border border-destructive/15 bg-gradient-to-br from-destructive/5 via-transparent to-transparent backdrop-blur-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Needs Attention</h3>
              <p className="text-[10px] text-muted-foreground">
                {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? "s" : ""} detected
              </p>
            </div>
          </div>
          {alerts.length > 0 && dismissed.size > 0 && (
            <button
              onClick={() => setDismissed(new Set())}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Show all ({alerts.length})
            </button>
          )}
        </div>

        <div className="space-y-2">
          {visibleAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const TypeIcon = typeConfig[alert.type].icon;
            const isExpanded = expanded === alert.id;

            return (
              <div
                key={alert.id}
                className={`${config.bg} rounded-lg border ${config.border} overflow-hidden transition-all duration-200`}
              >
                <div className="flex items-start gap-3 p-3">
                  <div className={`mt-0.5 ${config.color}`}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-bold text-foreground">{alert.title}</p>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {alert.description}
                    </p>

                    {alert.transactionIds.length > 0 && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : alert.id)}
                        className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {isExpanded ? "Hide" : "View"} details
                      </button>
                    )}

                    {isExpanded && alert.transactionIds.length > 0 && (
                      <div className="mt-2 p-2 rounded-md bg-muted/30 text-[10px] text-muted-foreground">
                        {alert.transactionIds.length} transaction{alert.transactionIds.length !== 1 ? "s" : ""} involved
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => dismiss(alert.id)}
                      className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center"
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
