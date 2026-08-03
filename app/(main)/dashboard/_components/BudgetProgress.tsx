"use client";
import { updateBudget } from "@/actions/budget";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/usefetch";
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function BudgetProgress({ initialBudget, currentExpenses }: { initialBudget: { amount: number } | null; currentExpenses: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(initialBudget?.amount?.toString() || "");

  const { loading: isLoading, fn: updateBudgetFn, data: updatedBudget, error } = useFetch(updateBudget);

  const percentUsed = useMemo(() => {
    if (!initialBudget) return 0;
    return (currentExpenses / initialBudget.amount) * 100;
  }, [initialBudget, currentExpenses]);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) { toast.error("Please enter a valid amount"); return; }
    await updateBudgetFn(amount);
  };

  const handleCancel = () => { setNewBudget(initialBudget?.amount?.toString() || ""); setIsEditing(false); };

  useEffect(() => { if (updatedBudget) { setIsEditing(false); toast.success("Budget updated successfully"); } }, [updatedBudget]);
  useEffect(() => { if (error) toast.error("Failed to update budget"); }, [error]);

  const barColor = percentUsed >= 80 ? "bg-destructive" : percentUsed >= 60 ? "bg-yellow-500" : "bg-primary";
  const textColor = percentUsed >= 80 ? "text-destructive" : percentUsed >= 60 ? "text-yellow-500" : "text-primary";

  return (
    <div className="glass rounded-xl">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Budget Tracker</p>
            <h3 className="text-lg font-bold text-foreground">Monthly Budget</h3>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5">
                <Input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)}
                  className="h-8 w-32 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-sm font-semibold"
                  placeholder="Amount" autoFocus disabled={isLoading} />
                <button onClick={handleUpdateBudget} disabled={isLoading} className="w-7 h-7 bg-primary text-white rounded-lg hover:opacity-80 transition flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={handleCancel} disabled={isLoading} className="w-7 h-7 border border-border text-muted-foreground hover:border-destructive hover:text-destructive rounded-lg transition flex items-center justify-center">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {initialBudget ? `$${currentExpenses.toFixed(2)} of $${initialBudget.amount.toFixed(2)} spent` : "No budget set"}
                </p>
                <button onClick={() => setIsEditing(true)} className="w-7 h-7 border border-border text-muted-foreground hover:border-primary hover:text-primary rounded-lg transition flex items-center justify-center">
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {initialBudget && (
          <div className="space-y-3">
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentUsed, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Usage</span>
              <span className={`font-bold ${textColor}`}>{percentUsed.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
