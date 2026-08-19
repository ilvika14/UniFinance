"use client";

import React, { useEffect, useState } from "react";
import { LuPen, LuLogOut, LuUser } from "react-icons/lu";
import { HiOutlineHome, HiOutlineSun, HiOutlineMoon, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [user, setUser] = useState<{ userId: string; email: string; name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong border-b border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo_unif.png"
            alt="UniFinance"
            className="h-16 w-auto group-hover:scale-105 transition-transform duration-300"
            style={{ filter: "hue-rotate(70deg) saturate(1.2)" }}
          />
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center space-x-1">
          {!user && !loading && (
            <>
              <a href="#features" className="relative text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl hover:bg-muted/50 transition-all group">
                Features
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 gradient rounded-full transition-all duration-300 group-hover:w-6" />
              </a>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {mounted && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              title="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -8, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 8, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          )}

          {/* Auth buttons */}
          {user && (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
                  <HiOutlineHome size={16} />
                  <span className="hidden md:inline">Home</span>
                </Button>
              </Link>
              <Link href="/transactions/search">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
                  <HiOutlineMagnifyingGlass size={16} />
                  <span className="hidden md:inline">Search</span>
                </Button>
              </Link>
              <Link href="/transactions/create">
                <Button size="sm" className="gap-2 gradient text-white rounded-xl">
                  <LuPen size={16} />
                  <span className="hidden md:inline">Add</span>
                </Button>
              </Link>
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <LuUser size={14} />
                </div>
                <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/10 transition-all" title="Sign out">
                  <LuLogOut size={14} />
                </button>
              </div>
            </>
          )}

          {!user && !loading && (
            <Link href="/sign-in">
              <Button size="sm" className="gradient text-white rounded-xl px-5">
                Login
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
