"use client";

import { useState } from "react";
import { Database, ChevronDown, ChevronUp } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  dummyTransactions,
  dummyAccounts,
  dummyBudgets,
} from "@/data/dummy-data";
import { formatCurrency } from "@/lib/currencies";

type Tab = "transactions" | "accounts" | "budgets";

export default function DummyDataViewer() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("transactions");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "transactions", label: "Transactions", count: dummyTransactions.length },
    { key: "accounts", label: "Accounts", count: dummyAccounts.length },
    { key: "budgets", label: "Budgets", count: dummyBudgets.length },
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-all text-sm font-medium text-muted-foreground hover:text-foreground">
          <Database className="h-4 w-4" />
          View Sample Data
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Sample Data
          </DrawerTitle>
          <DrawerDescription>
            Browse preloaded dummy transactions, accounts, and budgets.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-2 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="px-4 pb-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "transactions" && <TransactionsTable />}
          {activeTab === "accounts" && <AccountsTable />}
          {activeTab === "budgets" && <BudgetsTable />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function TransactionsTable() {
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...dummyTransactions].sort((a, b) =>
    sortAsc ? a.amount - b.amount : b.amount - a.amount
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead
            className="cursor-pointer select-none"
            onClick={() => setSortAsc(!sortAsc)}
          >
            <span className="inline-flex items-center gap-1">
              Amount
              {sortAsc ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((txn) => (
          <TableRow key={txn.id}>
            <TableCell className="font-medium">{txn.description}</TableCell>
            <TableCell>
              <Badge variant="outline">{txn.category}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{txn.date}</TableCell>
            <TableCell>
              <Badge
                variant={
                  txn.status === "COMPLETED"
                    ? "default"
                    : txn.status === "PENDING"
                    ? "secondary"
                    : "destructive"
                }
              >
                {txn.status}
              </Badge>
            </TableCell>
            <TableCell
              className={`font-semibold ${
                txn.type === "INCOME" ? "text-primary" : "text-destructive"
              }`}
            >
              {txn.type === "INCOME" ? "+" : "-"}{formatCurrency(txn.amount, "INR")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AccountsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dummyAccounts.map((acc) => (
          <TableRow key={acc.id}>
            <TableCell className="font-medium">{acc.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{acc.type}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{acc.currency}</TableCell>
            <TableCell className="text-right font-semibold text-primary">
              {formatCurrency(acc.balance, acc.currency ?? "INR")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BudgetsTable() {
  return (
    <div className="space-y-3">
      {dummyBudgets.map((b) => {
        const pct = Math.round((b.spent / b.limit) * 100);
        const over = pct >= 80;
        return (
          <div key={b.category} className="glass rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{b.category}</span>
              <span
                className={`text-xs font-semibold ${
                  over ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {formatCurrency(b.spent, "INR")} / {formatCurrency(b.limit, "INR")}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  over ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">{pct}% used</p>
          </div>
        );
      })}
    </div>
  );
}
