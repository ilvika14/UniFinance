"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";

function useCounter(end: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);
  return { count, mounted };
}

function StatCounter({ value, prefix = "", suffix = "", label, color }: { value: number; prefix?: string; suffix?: string; label: string; color: string }) {
  const { count, mounted } = useCounter(value, 2200, 800);
  return (
    <div className="bg-card/80 p-4 md:p-5 rounded-xl border border-border/50 hover:border-primary/20 transition-colors duration-300">
      <div className="text-[10px] md:text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">{label}</div>
      <div className={`text-xl md:text-3xl font-bold ${color} tabular-nums`}>{prefix}{mounted ? count.toLocaleString() : value.toLocaleString()}{suffix}</div>
    </div>
  );
}

export default function Herosection() {
  const bars = [40, 60, 45, 80, 55, 90, 75, 100, 65, 85, 70, 95, 50, 85, 60];
  const activityItems = [
    { name: "Apple Store", cat: "Electronics", amt: "-₹84,915.00", date: "Today", icon: "A", income: false },
    { name: "Whole Foods", cat: "Groceries", amt: "-₹12,113.00", date: "Yesterday", icon: "W", income: false },
    { name: "Salary", cat: "Income", amt: "+₹4,42,000.00", date: "Mon", icon: "S", income: true },
    { name: "Netflix", cat: "Entertainment", amt: "-₹1,359.00", date: "Tue", icon: "N", income: false },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated floating orbs */}
      <div className="orb orb-emerald w-[600px] h-[600px] -top-40 -right-40 animate-float-slow" />
      <div className="orb orb-violet w-[500px] h-[500px] top-1/3 -left-40 animate-float-delay" />


      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col items-center text-center">

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.8rem,8.5vw,7.5rem)] font-bold leading-[0.92] tracking-tighter text-foreground mb-8"
          >
            YOUR FINANCES,
            <br />
            SIMPLIFIED.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed mb-12"
          >
            Track, analyse, and optimise your spending with real-time AI insights and smart automation that actually works.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-10 py-7 text-sm font-semibold gradient text-white rounded-2xl flex items-center justify-center gap-2 group">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto px-10 py-7 text-sm font-semibold rounded-2xl border-border flex items-center justify-center gap-2 group">
                See Features
                <span className="transition-transform group-hover:translate-x-0.5 text-muted-foreground">&rarr;</span>
              </Button>
            </Link>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-5 md:gap-8 mb-20"
          >
            {[
              { icon: <TrendingUp className="w-5 h-5" />, text: "Real-time Analytics", color: "text-primary" },
              { icon: <Shield className="w-5 h-5" />, text: "Bank-level Security", color: "text-accent" },
              { icon: <Zap className="w-5 h-5" />, text: "Smart Insights", color: "text-cyan-500 dark:text-cyan-400" },
            ].map((pill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className={`flex items-center gap-3 text-base font-semibold ${pill.color}`}
              >
                <div className="w-11 h-11 rounded-xl bg-muted/80 flex items-center justify-center">{pill.icon}</div>
                <span className="text-foreground">{pill.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Hero Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative h-[420px] sm:h-[520px] md:h-[640px] max-w-6xl mx-auto"
          >
            {/* Main dashboard panel */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[92%] md:w-[840px] h-[370px] md:h-[470px] glass-card rounded-3xl overflow-hidden flex flex-col z-10">
              {/* Title bar */}
              <div className="h-12 md:h-14 border-b border-border/50 flex items-center px-5 md:px-7 justify-between bg-card/30">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo_unif.png"
                    alt="UniFinance"
                    className="w-14 h-14 object-contain rounded-xl"
                    style={{ filter: "hue-rotate(70deg) saturate(1.2)" }}
                  />
                  <div className="font-semibold text-sm text-foreground">Dashboard</div>
                  <div className="hidden md:flex items-center gap-1.5 ml-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] text-primary font-medium">Live</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                    <span>Oct 2024</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <div className="w-2 h-2 rounded-full bg-muted" />
                </div>
              </div>

              {/* Dashboard body */}
              <div className="flex-1 p-5 md:p-8 bg-background/30">
                {/* Stat counters */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-8">
                  <StatCounter value={715743} prefix="₹" suffix="" label="Total Balance" color="text-foreground" />
                  <StatCounter value={52000} prefix="₹" suffix="" label="Monthly Spending" color="text-foreground" />
                  <div className="hidden md:flex bg-card/80 p-5 rounded-xl border border-border/50 flex-col justify-between hover:border-primary/20 transition-colors">
                    <div className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Quick Actions</div>
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 gradient text-white text-center py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity">Send</div>
                      <div className="flex-1 bg-muted/80 text-foreground text-center py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-muted transition-colors">Receive</div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-card/60 rounded-2xl border border-border/50 p-5 md:p-6 h-36 md:h-48 flex items-end gap-[3px] md:gap-1.5 overflow-hidden">
                  {bars.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 1.2 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="relative flex-1 h-full flex items-end origin-bottom group"
                    >
                      <div className="absolute inset-0 rounded-t-lg bg-muted/30" />
                      <div
                        className="relative w-full rounded-t-lg bg-gradient-to-t from-primary/90 to-emerald-400/80 group-hover:from-primary group-hover:to-emerald-300 transition-colors duration-200 cursor-pointer"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          ${Math.floor(h * 42).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Left floating card — Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -60, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block absolute left-0 top-[260px] w-[280px] glass-card rounded-2xl p-5 z-20 hover-tilt"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-sm text-foreground">Recent Activity</div>
                <div className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-1 rounded-md">Live</div>
              </div>
              <div className="space-y-3.5">
                {activityItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + i * 0.1 }}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${item.income ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground">{item.cat} &middot; {item.date}</div>
                      </div>
                    </div>
                    <div className={`text-[13px] font-bold tabular-nums ${item.income ? "text-primary" : "text-foreground"}`}>{item.amt}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right floating card — AI Insight */}
            <motion.div
              initial={{ opacity: 0, x: 60, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block absolute right-0 top-[260px] w-[270px] glass-card rounded-2xl p-6 z-20 hover-tilt"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">AI Insight</span>
              </div>
              <p className="text-[13px] leading-relaxed mb-5 text-muted-foreground">
                You&apos;ve spent <strong className="text-foreground">₹27,200</strong> more on dining out this month. Consider cutting back to hit your savings goal!
              </p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[72%] gradient rounded-full" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">72%</span>
              </div>
              <Link href="/dashboard" className="block">
                <button className="w-full py-2.5 gradient text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
                  View Details
                </button>
              </Link>
            </motion.div>

            {/* Decorative ring */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full pointer-events-none" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-accent/[0.03] rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
