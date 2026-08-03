"use client"
import React, { useEffect, useState } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useForm } from "react-hook-form";
import { Button } from "./button";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/lib/schema";
import { AlertCircle, CheckCircle, CreditCard, DollarSign, Loader2, Star, Wallet } from "lucide-react";
import { Switch } from "./switch";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectValue } from "./select";
import { SelectTrigger } from "@radix-ui/react-select";
import useFetch from "@/hooks/usefetch";
import { createAccount } from "@/actions/dashboard";
import { toast } from "sonner";

export default function CreateAccountDrawer({ children }: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", type: "CURRENT", balance: "", isDefault: false },
  });

  const { data: newAccount, error, loading: createAccountLoading, fn: createAccountFn } = useFetch(createAccount);
  useEffect(() => { if (newAccount) { toast.success("Account created successfully"); reset(); setOpen(false); } }, [newAccount, reset]);
  useEffect(() => { if (error) toast.error(error || "Failed to create account"); }, [error]);

  const onSubmit = async (data: { name: string; type: string; balance: string; isDefault: boolean }) => { await createAccountFn(data); };

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh] rounded-t-2xl border border-border bg-card">
          <DrawerHeader className="border-b border-border bg-muted/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DrawerTitle className="text-lg font-semibold text-foreground">Create New Account</DrawerTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Add a new account to manage your finances</p>
              </div>
            </div>
          </DrawerHeader>

          <div className="px-5 pb-6 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-foreground">Account Name</label>
                <div className="relative">
                  <Input id="name" placeholder="e.g., Main Checking" className="pl-9 h-10 bg-muted border-border rounded-xl" {...register("name")} />
                  <CreditCard className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium text-foreground">Account Type</label>
                <Select onValueChange={(value) => setValue("type", value as "CURRENT" | "SAVINGS")} defaultValue={watch("type")}>
                  <SelectTrigger id="type" className="h-10 px-2 rounded-xl border border-border bg-muted hover:bg-muted/80 transition-colors focus:border-primary focus:ring-0">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="CURRENT" className="cursor-pointer rounded-lg">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-full" /><span>Current Account</span></div>
                    </SelectItem>
                    <SelectItem value="SAVINGS" className="cursor-pointer rounded-lg">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-accent rounded-full" /><span>Savings Account</span></div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.type.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="balance" className="text-sm font-medium text-foreground">Initial Balance</label>
                <div className="relative">
                  <Input id="balance" type="number" step="0.01" placeholder="0.00" className="pl-9 h-10 bg-muted border-border rounded-xl" {...register("balance")} />
                  <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {errors.balance && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.balance.message}</p>}
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label htmlFor="isDefault" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />Default Account
                    </label>
                    <p className="text-xs text-muted-foreground ml-6">Automatically selected for new transactions</p>
                  </div>
                  <Switch id="isDefault" checked={watch("isDefault")} onCheckedChange={(checked) => setValue("isDefault", checked)} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <DrawerClose asChild>
                  <Button variant="outline" type="button" className="flex-1 h-10 rounded-xl border-border">Cancel</Button>
                </DrawerClose>
                <Button type="submit" className="flex-1 h-10 gradient text-white rounded-xl glow-emerald" disabled={createAccountLoading}>
                  {createAccountLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><CheckCircle className="mr-2 h-4 w-4" />Create</>}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
