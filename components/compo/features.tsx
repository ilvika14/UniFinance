"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, BarChart3, Brain, Lock, Smartphone, Bell, PieChart, Landmark, Search, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Budget Management",
    description: "Set custom budgets and track your spending in real-time. Get visual feedback on where your money is going each month.",
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/40",
  },
  {
    icon: Brain,
    title: "Smart Insights",
    description: "AI-powered analysis of your spending patterns. Receive actionable recommendations to optimise your financial health.",
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-500/40",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your data is encrypted and secure. We never share your financial information with third parties.",
    color: "from-rose-500 to-pink-600",
    borderColor: "border-rose-500/40",
  },
  {
    icon: Smartphone,
    title: "Receipt Scanning",
    description: "Snap a photo of any receipt and let AI extract the details automatically. No more manual data entry.",
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/40",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified about unusual spending, upcoming bills, and budget limits before they become problems.",
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/40",
  },
  {
    icon: PieChart,
    title: "Visual Reports",
    description: "Beautiful charts and graphs that make understanding your finances intuitive and even enjoyable.",
    color: "from-primary to-emerald-400",
    borderColor: "border-primary/40",
  },
  {
    icon: Landmark,
    title: "Add Bank Transactions",
    description: "Easily add and manage your bank transactions in one place.",
    color: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-500/40",
  },
  {
    icon: Search,
    title: "Merchant Search & Auto-Categorization",
    description: "Remember past merchant-to-category mappings and auto-suggest categories when the merchant name matches.",
    color: "from-fuchsia-500 to-pink-600",
    borderColor: "border-fuchsia-500/40",
  },
  {
    icon: Coins,
    title: "Multi-Currency Support",
    description: "Set your preferred currency per account with live exchange rates for seamless multi-currency management.",
    color: "from-yellow-500 to-amber-600",
    borderColor: "border-yellow-500/40",
  },
];

const CARD_VISIBLE = 3;

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  }, []);

  const handleDotClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + features.length) % features.length;

    if (diff === 0) {
      return {
        zIndex: 10,
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateZ: 0,
        opacity: 1,
        blur: 0,
        isActive: true,
      };
    }

    if (diff <= CARD_VISIBLE) {
      return {
        zIndex: CARD_VISIBLE - diff + 1,
        y: diff * 30,
        scale: 1 - diff * 0.06,
        rotateX: 2.5,
        rotateZ: 0,
        opacity: 1 - diff * 0.25,
        blur: diff * 0.5,
        isActive: false,
      };
    }

    return {
      zIndex: -1,
      y: 300,
      scale: 0.8,
      rotateX: 10,
      rotateZ: 0,
      opacity: 0,
      blur: 4,
      isActive: false,
    };
  };

  return (
    <section id="features" className="relative bg-background overflow-hidden">
      <div className="orb orb-emerald w-[500px] h-[500px] top-0 right-0 opacity-50" />
      <div className="orb orb-violet w-[400px] h-[400px] bottom-0 left-0 opacity-40" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-wider uppercase border border-primary/10">
              <Zap className="w-3 h-3" /> Features
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"
          >
            Master Your Finances
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground mt-5 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to manage, track, and grow your wealth — wrapped in an experience you&apos;ll actually enjoy.
          </motion.p>
        </div>

        <div
          className="relative max-w-lg mx-auto"
          style={{ height: "420px", perspective: "1200px" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {features.map((feature, i) => {
            const style = getCardStyle(i);
            const Icon = feature.icon;

            return (
              <motion.div
                key={i}
                animate={{
                  y: style.y,
                  scale: style.scale,
                  rotateX: style.rotateX,
                  rotateZ: style.rotateZ,
                  opacity: style.opacity,
                  filter: `blur(${style.blur}px)`,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  zIndex: style.zIndex,
                  transformOrigin: "center top",
                }}
                className={`absolute left-0 right-0 top-0 rounded-2xl p-7 md:p-9 transition-shadow duration-500 ${
                  style.isActive
                    ? `glass-card-strong border-2 ${feature.borderColor} shadow-2xl deck-card-active`
                    : "glass-card border border-white/10 shadow-lg deck-card-bg"
                }`}
              >
                <div className={`w-13 h-13 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2.5">{feature.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed mb-5">{feature.description}</p>

                {style.isActive && (
                  <div className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-[0.06] rounded-full blur-2xl`} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col items-center mt-12 gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/50 backdrop-blur border-white/10 hover:bg-white/10 hover:text-primary transition-all"
              onClick={handlePrev}
              aria-label="Previous feature"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              {features.map((_, i) => {
                const diff = (i - activeIndex + features.length) % features.length;
                const isActive = diff === 0;
                return (
                  <button
                    key={i}
                    onClick={() => handleDotClick(i)}
                    className={`transition-all duration-300 rounded-full ${
                      isActive
                        ? "w-8 h-2.5 bg-primary"
                        : "w-2 h-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/50 backdrop-blur border-white/10 hover:bg-white/10 hover:text-primary transition-all"
              onClick={handleNext}
              aria-label="Next feature"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 md:mt-24 glass-card rounded-3xl p-10 md:p-14 relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-mesh opacity-60" />
          <div className="orb orb-emerald w-[300px] h-[300px] -top-20 -right-20 opacity-40" />
          <div className="orb orb-violet w-[200px] h-[200px] -bottom-10 -left-10 opacity-30" />

          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl flex items-center justify-center mb-6 animate-float-slow">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Ready to take control?</h3>
            <p className="text-muted-foreground mb-8 max-w-lg text-base leading-relaxed">
              Join thousands of people who are already building better financial habits with UniFinance.
            </p>
            <Link href="/dashboard">
              <Button className="gradient text-white rounded-2xl px-10 py-7 text-sm font-semibold flex items-center gap-2 group">
                Start for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
