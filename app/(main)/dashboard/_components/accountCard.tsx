"use client";

import { updateDefaultAccount } from "@/actions/account";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/usefetch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  isDefault: boolean;
}

interface Props {
  account: Account;
}

export default function AccountCard({ account }: Props) {
  const { id, name, type, balance, isDefault } = account;

  const { data: updatedAccount, error, loading: updateAccountLoading, fn: updateDefaultFn } = useFetch(updateDefaultAccount);

  const handledefaultChange = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDefault) { toast.warning("You need at least one default account"); return; }
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount) toast.success("Account updated successfully");
    if (error) toast.error(error || "Failed to update account");
  }, [updatedAccount, error]);

  return (
    <Link href={`/account/${id}`} className="group block">
      <div className="relative min-h-[200px] glass rounded-xl hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />

        <div className="flex flex-row items-start justify-between px-5 pt-5 pb-2">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              {type.charAt(0) + type.slice(1).toLowerCase()} account
            </p>
            <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          </div>
          <div onClick={(e) => e.stopPropagation()} className="pt-1">
            <Switch className="cursor-pointer data-[state=checked]:bg-primary" checked={isDefault} onClick={handledefaultChange} disabled={updateAccountLoading} />
          </div>
        </div>

        <div className="flex-1 px-5 py-3">
          <p className="text-2xl font-bold text-foreground tracking-tight">
            ${parseFloat(balance).toFixed(2)}
          </p>
          {isDefault && (
            <span className="inline-block mt-2 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold rounded-lg">
              Default
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs">
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5 text-destructive font-medium">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Expense</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
