"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/usefetch";
import { transactionSchema } from "@/lib/schema";
import { createTransaction, updateTransaction, FormDataTransaction } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import CreateAccountDrawer from "@/components/ui/create-account-drawer";
import { cn } from "@/lib/utils";
import { ReceiptScanner } from "./recieptscanner";

type ScannedData = { amount?: number | string; date?: string | Date; description?: string; category?: string; merchantName?: string; };
type Account = { id: string; name: string; balance: number | string; isDefault?: boolean; };
type Category = { id: string; name: string; type: "INCOME" | "EXPENSE"; };

interface Props {
  accounts: Account[]; category: Category[]; editMode?: boolean;
  initialData?: { type: string; amount: string | number; description?: string; accountId: string; category: string; date: string | Date; isRecurring?: boolean; recurringInterval?: string; } | null;
}

export default function AddTransactionForm({ accounts = [], category = [], editMode = false, initialData = null }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormDataTransaction>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editMode && initialData
      ? { type: initialData.type as "INCOME" | "EXPENSE", amount: String(initialData.amount), description: initialData.description ?? "", accountId: initialData.accountId, category: initialData.category, date: new Date(initialData.date), isRecurring: initialData.isRecurring, recurringInterval: initialData.recurringInterval as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | undefined }
      : { type: "EXPENSE" as const, amount: "", description: "", accountId: accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id ?? "", category: "", date: new Date(), isRecurring: false },
  });

  const { fn: createFn, loading: createLoading, data: createResult } = useFetch(createTransaction);
  const { fn: updateFn, loading: updateLoading, data: updateResult } = useFetch(updateTransaction);
  const transactionLoading = editMode ? updateLoading : createLoading;
  const transactionResult = editMode ? updateResult : createResult;
  const handledRef = useRef(false);
  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const accountId = watch("accountId");
  const filteredCategories = category.filter((c) => c.type === type);

  const onSubmit = (data: FormDataTransaction) => {
    const payload = { ...data, amount: data.amount.toString() };
    if (editMode && editId) updateFn(editId, payload); else createFn(payload);
  };

  const handleScanComplete = (scanned: ScannedData) => {
    if (!scanned) return;
    if (scanned.amount) setValue("amount", scanned.amount.toString());
    if (scanned.date) setValue("date", new Date(scanned.date));
    if (scanned.description) setValue("description", scanned.description);
    if (scanned.category) setValue("category", scanned.category);
    toast.success("Receipt scanned successfully");
  };

  useEffect(() => {
    if (handledRef.current) return;
    if (transactionResult && !transactionLoading) {
      handledRef.current = true;
      toast.success(editMode ? "Transaction updated successfully" : "Transaction created successfully");
      const nextAccountId = (transactionResult as { data?: { accountId?: string } })?.data?.accountId ?? accountId;
      if (nextAccountId) router.push(`/account/${nextAccountId}`);
    }
  }, [transactionResult, transactionLoading, editMode, router, accountId]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl mb-10">
      <div className="border-b border-border px-6 py-5 bg-muted/30">
        <h2 className="text-xl font-bold gradient-title">{editMode ? "Edit transaction" : "New transaction"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Record income or expenses</p>
      </div>

      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      <div className="space-y-6 px-6 py-6">
        <Field label="Transaction type" error={errors.type?.message}>
          <Select value={type} onValueChange={(v) => setValue("type", v as "INCOME" | "EXPENSE")}>
            <SelectTrigger className="h-11 bg-muted border-border rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border rounded-xl">
              <SelectItem value="EXPENSE" className="rounded-lg">Expense</SelectItem>
              <SelectItem value="INCOME" className="rounded-lg">Income</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Amount" error={errors.amount?.message}>
            <Input type="number" step="0.01" className="h-11 bg-muted border-border rounded-xl" {...register("amount")} />
          </Field>
          <Field label="Account" error={errors.accountId?.message}>
            <Select value={accountId} onValueChange={(v) => setValue("accountId", v)}>
              <SelectTrigger className="h-11 bg-muted border-border rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                {accounts.map((a) => (<SelectItem key={a.id} value={a.id} className="rounded-lg">{a.name} - ${Number(a.balance).toFixed(2)}</SelectItem>))}
                <CreateAccountDrawer>
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-muted rounded-lg">+ Create account</Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Category" error={errors.category?.message}>
          <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger className="h-11 bg-muted border-border rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border rounded-xl">
              {filteredCategories.map((c) => (<SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Date" error={errors.date?.message}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-11 w-full justify-between bg-muted border-border text-foreground hover:bg-muted/80 rounded-xl", !date && "text-muted-foreground")}>
                {date ? format(date, "PPP") : "Pick a date"}<CalendarIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 bg-card border-border rounded-xl" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => setValue("date", d ?? new Date())} disabled={(d) => d > new Date()} />
            </PopoverContent>
          </Popover>
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <Input className="h-11 bg-muted border-border rounded-xl" {...register("description")} />
        </Field>

        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-5 py-4">
          <div>
            <p className="font-semibold text-foreground">Recurring transaction</p>
            <p className="text-xs text-muted-foreground">Repeat automatically</p>
          </div>
          <Switch checked={isRecurring} onCheckedChange={(v) => setValue("isRecurring", v)} />
        </div>

        {isRecurring && (
          <Field label="Recurring interval" error={errors.recurringInterval?.message}>
            <Select value={watch("recurringInterval")} onValueChange={(v) => setValue("recurringInterval", v as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY")}>
              <SelectTrigger className="h-11 bg-muted border-border rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="DAILY" className="rounded-lg">Daily</SelectItem>
                <SelectItem value="WEEKLY" className="rounded-lg">Weekly</SelectItem>
                <SelectItem value="MONTHLY" className="rounded-lg">Monthly</SelectItem>
                <SelectItem value="YEARLY" className="rounded-lg">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      </div>

      <div className="flex gap-3 border-t border-border bg-muted/30 px-6 py-5">
        <Button type="button" variant="outline" className="h-11 w-1/2 border-border rounded-xl" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={transactionLoading} className="h-11 w-1/2 gradient text-white rounded-xl glow-emerald">
          {transactionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Check className="mr-2 h-4 w-4" />{editMode ? "Update" : "Create"}</>}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
