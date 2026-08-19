"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Priya Mehta",
    role: "Freelance Designer",
    testimonial: "UniFinance completely changed how I manage my freelance income. The real-time insights are a game-changer — I finally know where my money goes each month.",
    initials: "PM",
    gradient: "from-emerald-500 to-teal-600",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Startup Founder",
    testimonial: "As a founder, tracking every penny is crucial. UniFinance makes it effortless with its intuitive interface. It's like having a CFO in my pocket.",
    initials: "JW",
    gradient: "from-violet-500 to-purple-600",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    role: "Marketing Manager",
    testimonial: "I've tried every finance app out there. UniFinance is the only one I've stuck with because it actually works. The AI insights feel like magic.",
    initials: "SJ",
    gradient: "from-rose-500 to-pink-600",
    rating: 5,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative bg-background py-24 md:py-32 overflow-hidden">
      <div className="orb orb-violet w-[500px] h-[500px] top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 opacity-40" />
      <div className="orb orb-emerald w-[400px] h-[400px] top-0 right-0 opacity-30" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-wider uppercase border border-accent/10">
              <Star className="w-3 h-3 fill-accent" /> Testimonials
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"
          >
            Loved by thousands
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground mt-5 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Don&apos;t just take our word for it. Here&apos;s what our users have to say.
          </motion.p>
        </div>

        {/* Testimonial cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto"
        >
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group glass-card rounded-2xl p-7 hover-lift flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-muted-foreground mb-6 flex-1">
                &ldquo;{item.testimonial}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-xs shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  {item.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link href="/dashboard">
            <Button className="gradient text-white rounded-2xl px-10 py-7 text-sm font-semibold flex items-center gap-2 mx-auto group">
              Start for Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
