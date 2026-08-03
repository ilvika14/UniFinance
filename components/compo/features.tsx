"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, BarChart3, Brain, Lock, Smartphone, Bell, PieChart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Budget Management",
    description: "Set custom budgets and track your spending in real-time. Get visual feedback on where your money is going each month.",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: Brain,
    title: "Smart Insights",
    description: "AI-powered analysis of your spending patterns. Receive actionable recommendations to optimise your financial health.",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your data is encrypted and secure. We never share your financial information with third parties.",
    color: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
  },
  {
    icon: Smartphone,
    title: "Receipt Scanning",
    description: "Snap a photo of any receipt and let AI extract the details automatically. No more manual data entry.",
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified about unusual spending, upcoming bills, and budget limits before they become problems.",
    color: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    icon: PieChart,
    title: "Visual Reports",
    description: "Beautiful charts and graphs that make understanding your finances intuitive and even enjoyable.",
    color: "from-primary to-emerald-400",
    glow: "shadow-emerald-500/20",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function Features() {
  return (
    <section id="features" className="relative bg-background overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-emerald w-[500px] h-[500px] top-0 right-0 opacity-50" />
      <div className="orb orb-violet w-[400px] h-[400px] bottom-0 left-0 opacity-40" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Section header */}
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

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="group glass-card rounded-2xl p-7 md:p-8 border-glow hover-lift cursor-default"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg ${feature.glow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2.5">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 md:mt-24 glass-card rounded-3xl p-10 md:p-14 border-glow relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-mesh opacity-60" />
          <div className="orb orb-emerald w-[300px] h-[300px] -top-20 -right-20 opacity-40" />
          <div className="orb orb-violet w-[200px] h-[200px] -bottom-10 -left-10 opacity-30" />

          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/25 animate-float-slow">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Ready to take control?</h3>
            <p className="text-muted-foreground mb-8 max-w-lg text-base leading-relaxed">
              Join thousands of people who are already building better financial habits with UniFinance.
            </p>
            <Link href="/dashboard">
              <Button className="gradient text-white rounded-2xl glow-emerald px-10 py-7 text-sm font-semibold flex items-center gap-2 group">
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
