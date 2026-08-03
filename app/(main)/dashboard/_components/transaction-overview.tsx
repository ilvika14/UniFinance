"use client";

import { memo, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Account } from "./accountCard";
import { Transaction } from "../../account/_components/transaction-table";

const COLORS = ["#34d399", "#fb7185", "#a78bfa", "#fbbf24", "#22d3ee", "#a1a1aa"];

interface Props { accounts: Account[]; transactions: Transaction[]; }

export const DashboardOverview = memo(function DashboardOverview({ accounts, transactions }: Props) {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id);

  const accountTransactions = useMemo(() => transactions.filter((t) => t.accountId === selectedAccountId), [transactions, selectedAccountId]);

  const recentTransactions = useMemo(() => {
    return [...accountTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [accountTransactions]);

  const pieChartData = useMemo(() => {
    const now = new Date();
    const map: Record<string, number> = {};
    for (const t of accountTransactions) {
      const d = new Date(t.date);
      if (t.type === "EXPENSE" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      }
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [accountTransactions]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Transactions */}
      <div className="glass rounded-xl">
        <div className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="h-8 w-[140px] bg-muted border-border rounded-lg text-xs">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border rounded-xl">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-xs rounded-lg">{account.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="px-5 pb-5 space-y-1">
          {recentTransactions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No recent transactions</p>
          ) : (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{transaction.description || "Untitled Transaction"}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), "PP")}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${transaction.type === "EXPENSE" ? "text-destructive" : "text-primary"}`}>
                  {transaction.type === "EXPENSE" ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                  ${Number(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="glass rounded-xl">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-foreground">Monthly Expense Breakdown</h3>
        </div>
        <div className="px-5 pb-5">
          {pieChartData.length === 0 ? (
            <p className="py-20 text-center text-sm text-muted-foreground">No expenses this month</p>
          ) : (
            <div className="h-[280px] bg-muted/50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`}
                    contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", color: "var(--foreground)" }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
