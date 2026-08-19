"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BalanceVisibilityContextValue {
  hidden: boolean;
  toggle: () => void;
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextValue>({
  hidden: false,
  toggle: () => {},
});

export function useBalanceVisibility() {
  return useContext(BalanceVisibilityContext);
}

export function BalanceVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const toggle = useCallback(() => setHidden((prev) => !prev), []);

  return (
    <BalanceVisibilityContext.Provider value={{ hidden, toggle }}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
}

export function BalanceToggle() {
  const { hidden, toggle } = useBalanceVisibility();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-all text-xs font-medium text-muted-foreground hover:text-foreground"
      title={hidden ? "Show balances" : "Hide balances"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={hidden ? "off" : "on"}
          initial={{ scale: 0.8, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
        >
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </motion.div>
      </AnimatePresence>
      <span className="hidden sm:inline">{hidden ? "Show" : "Hide"}</span>
    </button>
  );
}

export function SensitiveValue({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { hidden } = useBalanceVisibility();

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className="transition-all duration-500 ease-out"
        style={{
          filter: hidden ? "blur(8px)" : "blur(0px)",
          opacity: hidden ? 0.6 : 1,
          userSelect: hidden ? "none" : "auto",
        }}
      >
        {children}
      </div>
      <AnimatePresence>
        {hidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="px-2.5 py-1 rounded-lg bg-muted/80 backdrop-blur-sm border border-border/50">
              <span className="text-xs font-semibold text-muted-foreground">Hidden</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
