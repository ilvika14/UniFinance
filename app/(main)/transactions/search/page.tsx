"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal, Calendar, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { searchTransactions, type SearchFilters } from "@/actions/transaction";
import { defaultCategories, categoryColors } from "@/data/category";
import { GetUserAccounts } from "@/actions/dashboard";
import { format } from "date-fns";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: string | Date;
  description?: string | null;
  category?: string | null;
  account?: { id: string; name: string } | null;
};

type Account = {
  id: string;
  name: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export default function TransactionSearchPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [accountFilter, setAccountFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");

  const fetchTransactions = useCallback(async (page: number = 1) => {
    setLoading(true);
    const filters: SearchFilters = {
      page,
      pageSize: 20,
    };

    if (searchQuery.trim()) filters.query = searchQuery.trim();
    if (typeFilter !== "ALL") filters.type = typeFilter;
    if (categoryFilter !== "ALL") filters.category = categoryFilter;
    if (accountFilter !== "ALL") filters.accountId = accountFilter;
    if (dateFrom) filters.dateFrom = dateFrom.toISOString();
    if (dateTo) filters.dateTo = dateTo.toISOString();
    if (amountMin) filters.amountMin = parseFloat(amountMin);
    if (amountMax) filters.amountMax = parseFloat(amountMax);

    const result = await searchTransactions(filters);
    if (result.success && result.data) {
      setTransactions(result.data);
      setPagination(result.pagination!);
    }
    setLoading(false);
  }, [searchQuery, typeFilter, categoryFilter, accountFilter, dateFrom, dateTo, amountMin, amountMax]);

  useEffect(() => {
    GetUserAccounts().then((res) => {
      if (res.success && res.data) {
        setAccounts(res.data.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })));
      }
    });
    fetchTransactions(1);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => fetchTransactions(1), 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, typeFilter, categoryFilter, accountFilter, dateFrom, dateTo, amountMin, amountMax]);

  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setAccountFilter("ALL");
    setDateFrom(undefined);
    setDateTo(undefined);
    setAmountMin("");
    setAmountMax("");
  }

  const hasActiveFilters = searchQuery || typeFilter !== "ALL" || categoryFilter !== "ALL" || accountFilter !== "ALL" || dateFrom || dateTo || amountMin || amountMax;

  const expenseCategories = defaultCategories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = defaultCategories.filter((c) => c.type === "INCOME");
  const allCategories = [...expenseCategories, ...incomeCategories];

  function formatCurrency(amount: number) {
    return `₹${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDate(date: string | Date) {
    return format(new Date(date), "MMM dd, yyyy");
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Search Transactions</h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total} transaction{pagination.total !== 1 ? "s" : ""} found
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="glass rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions by description..."
              className="pl-10 h-11 bg-background border-border rounded-xl text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Account</label>
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger className="w-full bg-background border-border rounded-xl">
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Accounts</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Amount Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={amountMin}
                    onChange={(e) => setAmountMin(e.target.value)}
                    placeholder="Min"
                    className="h-9 text-xs bg-background border-border rounded-xl flex-1"
                  />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input
                    type="number"
                    value={amountMax}
                    onChange={(e) => setAmountMax(e.target.value)}
                    placeholder="Max"
                    className="h-9 text-xs bg-background border-border rounded-xl flex-1"
                  />
                </div>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Date From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-9 text-xs bg-background border-border rounded-xl font-normal"
                    >
                      <Calendar className="mr-2 h-3 w-3" />
                      {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Date To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-9 text-xs bg-background border-border rounded-xl font-normal"
                    >
                      <Calendar className="mr-2 h-3 w-3" />
                      {dateTo ? format(dateTo, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="glass rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 bg-muted rounded" />
                    <div className="h-2 w-24 bg-muted/50 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No transactions found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {transactions.map((t) => {
                  const cat = allCategories.find((c) => c.id === t.category);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => router.push(`/transactions/create?edit=${t.id}`)}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: cat ? `${cat.color}15` : "hsl(var(--muted))",
                          color: cat?.color || "hsl(var(--muted-foreground))",
                        }}
                      >
                        {cat?.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {t.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{
                              backgroundColor: cat ? `${cat.color}15` : "hsl(var(--muted))",
                              color: cat?.color || "hsl(var(--muted-foreground))",
                            }}
                          >
                            {cat?.name || t.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {t.account?.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(t.date)}
                          </span>
                        </div>
                      </div>
                      <div className={`text-sm font-bold tabular-nums ${t.type === "INCOME" ? "text-primary" : "text-destructive"}`}>
                        {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchTransactions(pagination.page - 1)}
                      className="h-8 w-8 p-0 rounded-xl"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchTransactions(pagination.page + 1)}
                      className="h-8 w-8 p-0 rounded-xl"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
