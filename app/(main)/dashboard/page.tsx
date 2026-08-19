import React, { Suspense } from "react";
import CreateAccountDrawer from "@/components/ui/create-account-drawer";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight } from "lucide-react";
import { getDashboardData, GetUserAccounts } from "@/actions/dashboard";
import AccountCard, { Account } from "./_components/accountCard";
import { getBudgetData } from "@/actions/budget";
import BudgetProgress from "./_components/BudgetProgress";
import { DashboardOverview } from "./_components/transaction-overview";
import MerchantInsights from "./_components/MerchantInsights";
import DashboardShell, { DashboardHeader, DashboardStat } from "./_components/DashboardShell";
import AIMonthlyBriefing from "./_components/AIMonthlyBriefing";
import SpendingAlerts from "./_components/SpendingAlerts";
import SubscriptionAudit from "./_components/SubscriptionAudit";
import DummyDataViewer from "./_components/DummyDataViewer";
import SeedDataButton from "./_components/SeedDataButton";
import CsvImportCard from "./_components/CsvImportCard";
import { defaultCategories } from "@/data/category";

export default async function Dashboardpage() {
  const accountsPromise = GetUserAccounts();
  const dashboardPromise = getDashboardData();
  const data = await accountsPromise;
  const accounts: Account[] = data?.success && Array.isArray(data.data) ? data.data : [];
  const defaultAccount = accounts.find((a) => a.isDefault);
  const defaultCurrency = defaultAccount?.currency ?? "INR";
  const budgetPromise = defaultAccount ? getBudgetData(defaultAccount.id) : Promise.resolve(null);
  const [transactionsResult, budgetData] = await Promise.all([dashboardPromise, budgetPromise]);

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const transactionsArray = transactionsResult?.success && Array.isArray(transactionsResult.data) ? transactionsResult.data : [];
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
    <DashboardShell>
      {/* Header with Balance Toggle */}
      <DashboardHeader totalBalance={totalBalance} />

      {/* AI Monthly Briefing */}
      <AIMonthlyBriefing />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label="Total Balance"
          amount={totalBalance}
          icon={<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Wallet className="h-4 w-4 text-primary" /></div>}
          currency={defaultCurrency}
        />
        <DashboardStat
          label="Monthly Income"
          amount={monthlyIncome}
          icon={<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>}
          color="text-primary"
          currency={defaultCurrency}
        />
        <DashboardStat
          label="Monthly Expenses"
          amount={monthlyExpenses}
          icon={<div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"><TrendingDown className="h-4 w-4 text-destructive" /></div>}
          color="text-destructive"
          currency={defaultCurrency}
        />
        <DashboardStat
          label="Net Balance"
          amount={netBalance}
          icon={
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
              <ArrowUpRight className={`h-4 w-4 ${netBalance >= 0 ? "text-primary" : "text-destructive"}`} />
            </div>
          }
          color={netBalance >= 0 ? "text-primary" : "text-destructive"}
          currency={defaultCurrency}
        />
      </div>

      {/* CSV Import */}
      <CsvImportCard
        accounts={accounts}
        categories={defaultCategories as Array<{ id: string; name: string; type: string }>}
      />

      {/* Budget */}
      {defaultAccount && budgetData?.success && (
        <BudgetProgress initialBudget={budgetData.data?.budget ?? null} currentExpenses={budgetData.data?.currentExpenses || 0} currency={defaultCurrency} />
      )}

      {/* Spending Alerts */}
      <SpendingAlerts />

      {/* Transaction Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Transaction Overview</h2>
        <Suspense>
          <DashboardOverview accounts={accounts} transactions={transactionsArray} />
        </Suspense>
      </div>

      {/* Merchant Insights */}
      <div className="space-y-4">
        <MerchantInsights transactions={transactionsArray} currency={defaultCurrency} />
      </div>

      {/* Subscription Audit */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Subscription Audit</h2>
        <SubscriptionAudit />
      </div>

      {/* Sample Data */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Sample Data</h2>
          <SeedDataButton />
        </div>
        <DummyDataViewer />
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
    </DashboardShell>
  );
}
