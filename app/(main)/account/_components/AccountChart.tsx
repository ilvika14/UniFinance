"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Transaction } from "./transaction-table";
import { useMemo, useState } from "react";
import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};
type RangeKey = keyof typeof DATE_RANGES;

interface Totals { income: number; expense: number; }

export default function AccountChart({ transactions }: { transactions: Transaction[] }) {
  const [dateRange, setDateRange] = useState<RangeKey>("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days ? startOfDay(subDays(now, range.days)) : startOfDay(new Date(0));
    const filtered = transactions.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now));
    const grouped = filtered.reduce((acc: Record<string, { date: string; income: number; expense: number }>, t) => {
      const date = format(new Date(t.date), "MMM dd");
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      t.type === "INCOME" ? (acc[date].income += Number(t.amount)) : (acc[date].expense += Number(t.amount));
      return acc;
    }, {});
    return Object.values(grouped);
  }, [transactions, dateRange]);

  const totals = useMemo<Totals>(() => {
    return filteredData.reduce((acc: Totals, d: { date: string; income: number; expense: number }) => ({
      income: acc.income + d.income, expense: acc.expense + d.expense,
    }), { income: 0, expense: 0 });
  }, [filteredData]);

  const net = totals.income - totals.expense;

  return (
    <section aria-labelledby="transaction-overview-title" className="w-full">
      <Card className="glass rounded-xl border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle id="transaction-overview-title" className="text-lg font-bold text-foreground">Transaction Overview</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Income vs expenses for the selected period</p>
          </div>
          <Select value={dateRange} onValueChange={(val) => setDateRange(val as RangeKey)}>
            <SelectTrigger aria-label="Select date range" className="w-[160px] bg-muted border-border rounded-xl text-xs">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border rounded-xl">
              {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key} className="text-xs rounded-lg">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-muted/50 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground font-medium">Total Income</p>
              <p className="mt-1 text-xl font-bold text-primary">${totals.income.toFixed(2)}</p>
            </div>
            <div className="bg-muted/50 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground font-medium">Total Expenses</p>
              <p className="mt-1 text-xl font-bold text-destructive">${totals.expense.toFixed(2)}</p>
            </div>
            <div className="bg-muted/50 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground font-medium">Net Balance</p>
              <p className={`mt-1 text-xl font-bold ${net >= 0 ? "text-primary" : "text-destructive"}`}>${net.toFixed(2)}</p>
            </div>
          </div>

          <div className="h-[320px] bg-muted/30 rounded-xl p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => `$${v}`}
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)", fontSize: "12px" }} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#34d399" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#fb7185" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
