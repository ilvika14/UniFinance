import { getAccountWithTransaction } from "@/actions/account";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";
import TransactionTable from "../_components/transaction-table";
import AccountChart from "../_components/AccountChart";

export const metadata = { title: "Account Overview - UniFinance" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const accountData = await getAccountWithTransaction(id);
  if (!accountData) return notFound();
  const { transactions, ...account } = accountData;

  return (
    <section className="min-h-screen bg-background">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-8">
        <header className="glass rounded-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between p-6">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()} account
              </p>
              <h1 id="account-title" className="text-3xl font-bold tracking-tight text-foreground">{account.name}</h1>
            </div>
            <div className="sm:text-right">
              <p className="text-3xl font-bold tracking-tight text-foreground">${Number(account.balance).toFixed(2)}</p>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                {account._count?.transactions ?? 0} transaction{(account._count?.transactions ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </header>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Income vs Expenses</h2>
          <Suspense fallback={<BarLoader width="100%" color="#34d399" className="mt-2" />}>
            <AccountChart transactions={transactions} />
          </Suspense>
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Transaction History</h2>
          <Suspense fallback={<BarLoader width="100%" color="#34d399" className="mt-2" />}>
            <TransactionTable transactions={transactions} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
