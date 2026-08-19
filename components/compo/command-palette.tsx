"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSearch,
  LuLayoutDashboard,
  LuPen,
  LuArrowLeftRight,
  LuWallet,
  LuTag,
  LuReceipt,
  LuChartLine,
  LuSettings,
  LuCreditCard,
  LuPiggyBank,
  LuTrendingUp,
  LuFileText,
  LuZap,
  LuX,
} from "react-icons/lu";
import { defaultCategories } from "@/data/category";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  shortcut?: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigationItems: CommandItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Go to dashboard",
      icon: <LuLayoutDashboard size={18} />,
      action: () => { router.push("/dashboard"); close(); },
      keywords: ["home", "dashboard", "main"],
      shortcut: "G D",
    },
    {
      id: "new-transaction",
      label: "New Transaction",
      description: "Create a new transaction",
      icon: <LuPen size={18} />,
      action: () => { router.push("/transactions/create"); close(); },
      keywords: ["new", "add", "transaction", "create", "expense", "income"],
      shortcut: "Ctrl+N",
    },
    {
      id: "accounts",
      label: "My Accounts",
      description: "View all accounts",
      icon: <LuWallet size={18} />,
      action: () => { router.push("/dashboard"); close(); },
      keywords: ["accounts", "wallet", "balance"],
    },
    {
      id: "briefing",
      label: "AI Monthly Briefing",
      description: "View your financial health report",
      icon: <LuChartLine size={18} />,
      action: () => { router.push("/briefing"); close(); },
      keywords: ["briefing", "report", "ai", "insights", "monthly"],
    },
  ];

  const categoryItems: CommandItem[] = defaultCategories.map((cat) => ({
    id: `cat-${cat.id}`,
    label: cat.name,
    description: cat.type === "INCOME" ? "Income category" : "Expense category",
    icon: <LuTag size={18} style={{ color: cat.color }} />,
    action: () => { router.push("/dashboard"); close(); },
    keywords: [cat.name.toLowerCase(), cat.type.toLowerCase(), "category"],
  }));

  const quickActions: CommandItem[] = [
    {
      id: "theme",
      label: "Toggle Theme",
      description: "Switch between light and dark mode",
      icon: <LuSettings size={18} />,
      action: () => {
        document.querySelector<HTMLButtonElement>("[title='Toggle theme']")?.click();
        close();
      },
      keywords: ["theme", "dark", "light", "mode", "toggle"],
    },
    {
      id: "seed",
      label: "Seed Sample Data",
      description: "Populate with sample transactions",
      icon: <LuZap size={18} />,
      action: () => { router.push("/dashboard"); close(); },
      keywords: ["seed", "sample", "demo", "data", "populate"],
    },
  ];

  const allItems = [...navigationItems, ...quickActions, ...categoryItems];

  const filtered = query.trim()
    ? allItems.filter((item) =>
        item.keywords.some((kw) => kw.includes(query.toLowerCase())) ||
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.children[selectedIndex] as HTMLElement;
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg"
          >
            <div className="glass-card-strong rounded-2xl border border-border/50 shadow-2xl shadow-black/20 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <LuSearch size={18} className="text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands, pages, categories..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  onClick={close}
                  className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LuX size={14} />
                </button>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2 px-2">
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                )}

                {!query.trim() && (
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                    Navigation
                  </div>
                )}
                {filtered.slice(0, !query.trim() ? navigationItems.length + quickActions.length : filtered.length).map((item, index) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      index === selectedIndex
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground/70">{item.description}</div>
                      )}
                    </div>
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                ))}

                {query.trim() && filtered.length > 0 && (
                  <>
                    <div className="px-2 pt-2 pb-1.5 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                      Results
                    </div>
                    {filtered.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          index === selectedIndex
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground/70">{item.description}</div>
                          )}
                        </div>
                        {item.shortcut && (
                          <span className="text-[10px] font-mono text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50 text-[11px] text-muted-foreground/50">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono bg-muted/30 px-1 py-0.5 rounded text-[10px]">&uarr;&darr;</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono bg-muted/30 px-1 py-0.5 rounded text-[10px]">Enter</kbd>
                    select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-muted/30 px-1 py-0.5 rounded text-[10px]">Esc</kbd>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
