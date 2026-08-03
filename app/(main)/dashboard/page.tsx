import React, { Suspense } from "react";
import CreateAccountDrawer from "@/components/ui/create-account-drawer";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight } from "lucide-react";
import { getDashboardData, GetUserAccounts } from "@/actions/dashboard";
import AccountCard, { Account } from "./_components/accountCard";
import { getBudgetData } from "@/actions/budget";
import BudgetProgress from "./_components/BudgetProgress";
import { DashboardOverview } from "./_components/transaction-overview";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Dashboardpage() {
  const accountsPromise = GetUserAccounts();
  const dashboardPromise = getDashboardData();
  const data = await accountsPromise;
  const accounts: Account[] = data?.success && Array.isArray(data.data) ? data.data : [];
  const defaultAccount = accounts.find((a) => a.isDefault);
  const budgetPromise = defaultAccount ? getBudgetData(defaultAccount.id) : Promise.resolve(null);
  const [transactions, budgetData] = await Promise.all([dashboardPromise, budgetPromise]);

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || "0"), 0);
  const transactionsArray = Array.isArray(transactions) ? transactions : [];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = transactionsArray
    .filter((t) => { if (!t || !t.date) return false; const d = new Date(t.date); return t.type === "INCOME" && d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const monthlyExpenses = transactionsArray
    .filter((t) => { if (!t || !t.date) return false; const d = new Date(t.date); return t.type === "EXPENSE" && d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = monthlyIncome - monthlyExpenses;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Overview</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Your complete financial picture</p>
          </div>
          <Link href="/transactions/create">
            <Button className="gradient text-white rounded-xl glow-emerald gap-2 px-5 py-5">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass rounded-xl p-5 group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Total Balance</p>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Wallet className="h-4 w-4 text-primary" /></div>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight">${totalBalance.toFixed(2)}</p>
          </div>

          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Monthly Income</p>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>
            </div>
            <p className="text-2xl font-bold text-primary tracking-tight">${monthlyIncome.toFixed(2)}</p>
          </div>

          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Monthly Expenses</p>
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"><TrendingDown className="h-4 w-4 text-destructive" /></div>
            </div>
            <p className="text-2xl font-bold text-destructive tracking-tight">${monthlyExpenses.toFixed(2)}</p>
          </div>

          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Net Balance</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                <ArrowUpRight className={`h-4 w-4 ${netBalance >= 0 ? "text-primary" : "text-destructive"}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold tracking-tight ${netBalance >= 0 ? "text-primary" : "text-destructive"}`}>${netBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Budget */}
        {defaultAccount && budgetData?.success && (
          <BudgetProgress initialBudget={budgetData.data?.budget ?? null} currentExpenses={budgetData.data?.currentExpenses || 0} />
        )}

        {/* Transaction Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Transaction Overview</h2>
          <Suspense>
            <DashboardOverview accounts={accounts} transactions={transactions} />
          </Suspense>
        </div>

        {/* Accounts */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Your Accounts</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateAccountDrawer>
              <div className="border-2 border-dashed border-border bg-card rounded-xl transition-all hover:border-primary/30 hover:bg-muted/50 min-h-[200px] flex flex-col items-center justify-center gap-3 p-8 text-center cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><Plus className="h-5 w-5 text-muted-foreground" /></div>
                <p className="text-sm font-semibold text-foreground">Create New Account</p>
                <p className="text-xs text-muted-foreground">Add a new account to track</p>
              </div>
            </CreateAccountDrawer>

            {Array.isArray(accounts) && accounts.map((account: Account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
