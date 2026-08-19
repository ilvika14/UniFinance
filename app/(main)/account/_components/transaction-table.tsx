"use client";

import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryColors } from "@/data/category";
import { format } from "date-fns";
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, Trash, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/usefetch";
import { bulkDeleteTransactions } from "@/actions/account";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";
import { formatCurrency } from "@/lib/currencies";

const RECURRING_INTERVALS = { DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly", YEARLY: "Yearly" };

export interface Transaction {
  id: string; date: Date | string; description: string | null; category: string;
  amount: string | number; accountId: string; type: string;
  isRecurring: boolean; recurringInterval?: string | null; nextRecurringDate?: string | Date | null;
}

function SortIcon({ field, currentSort }: { field: string; currentSort: { field: string; direction: string } }) {
  if (currentSort.field !== field) return <ChevronDown className="h-3 w-3 opacity-30" />;
  return currentSort.direction === "asc" ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />;
}

export default function TransactionTable({ transactions, currency = "INR" }: { transactions: Transaction[]; currency?: string }) {
  const router = useRouter();
  const [selectedIds, setSeletedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 10;

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    if (searchTerm) { const q = searchTerm.toLowerCase(); result = result.filter((t) => t.description?.toLowerCase().includes(q)); }
    if (typeFilter && typeFilter !== "all") result = result.filter((t) => t.type === typeFilter);
    if (recurringFilter && recurringFilter !== "all") result = result.filter((t) => recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring);
    result.sort((a, b) => {
      let c = 0;
      if (sortConfig.field === "date") c = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortConfig.field === "amount") c = Number(a.amount) - Number(b.amount);
      if (sortConfig.field === "category") c = a.category.localeCompare(b.category);
      return sortConfig.direction === "asc" ? c : -c;
    });
    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => { const s = (currentPage - 1) * ITEMS_PER_PAGE; return filteredAndSortedTransactions.slice(s, s + ITEMS_PER_PAGE); }, [filteredAndSortedTransactions, currentPage]);
  const handleSort = (field: string) => { setSortConfig((c) => ({ field, direction: c.field === field && c.direction === "asc" ? "desc" : "asc" })); };

  const { loading: deleteLoading, fn: deleteFn, data: deleted } = useFetch(bulkDeleteTransactions);
  useEffect(() => { if (deleted && !deleteLoading) { toast.success("Transactions deleted successfully"); setSeletedIds([]); setDeleteConfirmOpen(false); setPendingDeleteIds([]); } }, [deleted, deleteLoading]);

  const confirmDelete = (ids: string[]) => {
    setPendingDeleteIds(ids);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteIds.length > 0) {
      deleteFn(pendingDeleteIds);
    }
  };

  return (
    <section aria-labelledby="transactions-title" className="space-y-4">
      {deleteLoading && <BarLoader width="100%" color="#34d399" />}

      <div className="flex flex-wrap items-center gap-3 glass rounded-xl p-4">
        <h2 id="transactions-title" className="sr-only">Transactions Table</h2>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input aria-label="Search transactions" placeholder="Search transactions..." value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="h-9 bg-muted border-border rounded-xl pl-9 text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-primary/30" />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[120px] bg-muted border-border rounded-xl text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            <SelectItem value="all" className="text-xs rounded-lg">All</SelectItem>
            <SelectItem value="INCOME" className="text-primary text-xs rounded-lg">Income</SelectItem>
            <SelectItem value="EXPENSE" className="text-destructive text-xs rounded-lg">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={recurringFilter} onValueChange={setRecurringFilter}>
          <SelectTrigger className="h-9 w-[150px] bg-muted border-border rounded-xl text-xs"><SelectValue placeholder="All Transactions" /></SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            <SelectItem value="all" className="text-xs rounded-lg">All</SelectItem>
            <SelectItem value="recurring" className="text-xs rounded-lg">Recurring</SelectItem>
            <SelectItem value="non-recurring" className="text-xs rounded-lg">One-time</SelectItem>
          </SelectContent>
        </Select>

        {(searchTerm || (typeFilter && typeFilter !== "all") || (recurringFilter && recurringFilter !== "all")) && (
          <button aria-label="Clear filters" onClick={() => { setSearchTerm(""); setTypeFilter(""); setRecurringFilter(""); }}
            className="w-9 h-9 border border-border text-muted-foreground hover:border-destructive hover:text-destructive rounded-xl transition-colors flex items-center justify-center">
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {selectedIds.length > 0 && (
          <button onClick={() => confirmDelete(selectedIds)} className="flex items-center gap-2 bg-destructive hover:opacity-80 text-white text-sm font-semibold px-4 h-9 rounded-xl transition-all">
            <Trash className="h-3.5 w-3.5" />Delete ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="overflow-x-auto glass rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={paginatedTransactions.length > 0 && paginatedTransactions.every((t) => selectedIds.includes(t.id))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const newIds = paginatedTransactions.map((t) => t.id);
                      setSeletedIds((prev) => [...new Set([...prev, ...newIds])]);
                    } else {
                      const pageIds = new Set(paginatedTransactions.map((t) => t.id));
                      setSeletedIds((prev) => prev.filter((id) => !pageIds.has(id)));
                    }
                  }}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead onClick={() => handleSort("date")} className="cursor-pointer text-muted-foreground text-xs font-semibold uppercase tracking-wider hover:text-foreground transition-colors">
                <span className="flex items-center gap-1">Date <SortIcon field="date" currentSort={sortConfig} /></span>
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Description</TableHead>
              <TableHead onClick={() => handleSort("category")} className="cursor-pointer text-muted-foreground text-xs font-semibold uppercase tracking-wider hover:text-foreground transition-colors">
                <span className="flex items-center gap-1">Category <SortIcon field="category" currentSort={sortConfig} /></span>
              </TableHead>
              <TableHead onClick={() => handleSort("amount")} className="cursor-pointer text-muted-foreground text-xs font-semibold uppercase tracking-wider hover:text-foreground transition-colors">
                <span className="flex items-center gap-1">Amount <SortIcon field="amount" currentSort={sortConfig} /></span>
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Recurring</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No transactions found.</TableCell></TableRow>
            ) : (
              paginatedTransactions.map((t) => (
                <TableRow key={t.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Checkbox checked={selectedIds.includes(t.id)} onCheckedChange={() => setSeletedIds((c) => c.includes(t.id) ? c.filter((i) => i !== t.id) : [...c, t.id])}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(t.date), "PP")}</TableCell>
                  <TableCell className="text-foreground text-sm font-medium">{t.description}</TableCell>
                  <TableCell>
                    <span style={{ background: categoryColors[t.category] || "#64748b" }} className="px-2 py-1 text-[10px] font-semibold text-white rounded-lg">{t.category}</span>
                  </TableCell>
                  <TableCell className={`text-sm font-semibold ${t.type === "INCOME" ? "text-primary" : "text-destructive"}`}>
                    {t.type === "INCOME" ? "+" : "-"}{formatCurrency(Number(t.amount), currency)}
                  </TableCell>
                  <TableCell>
                    {t.isRecurring ? (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold rounded-lg">
                        <RefreshCw className="h-2.5 w-2.5" />{RECURRING_INTERVALS[t.recurringInterval as keyof typeof RECURRING_INTERVALS]}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold rounded-lg">
                        <Clock className="h-2.5 w-2.5" />One-time
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center justify-center">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border-border rounded-xl">
                        <DropdownMenuItem onClick={() => router.push(`/transactions/create?edit=${t.id}`)} className="text-sm rounded-lg cursor-pointer">Edit</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem onClick={() => confirmDelete([t.id])} className="text-destructive text-sm rounded-lg cursor-pointer">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
            className="w-9 h-9 border border-border rounded-xl hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
            className="w-9 h-9 border border-border rounded-xl hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 z-50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Delete Transaction{pendingDeleteIds.length > 1 ? "s" : ""}?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete {pendingDeleteIds.length} transaction{pendingDeleteIds.length > 1 ? "s" : ""} and adjust account balances. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 h-9 text-sm font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} disabled={deleteLoading} className="px-4 h-9 text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-xl transition-colors disabled:opacity-50">
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
