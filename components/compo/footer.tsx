"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Documentation", "API"],
  Company: ["About", "Blog", "Careers", "Press Kit"],
  Support: ["Help Center", "Contact", "Status", "Community"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function UniFinanceFooter() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); setTimeout(() => setSubscribed(false), 3000); }
  };

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* Background effects */}
      <div className="orb orb-emerald w-[400px] h-[400px] -bottom-40 -right-40 opacity-30" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Newsletter section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 md:py-16 border-b border-border"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Stay in the loop</h3>
              <p className="text-sm text-muted-foreground">Get product updates and financial tips. No spam, ever.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 md:w-64 h-11 px-4 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <button
                type="submit"
                className="h-11 px-5 gradient text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
              >
                {subscribed ? "Subscribed!" : <>Subscribe <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Links grid */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <img
              src="/logo_unif.png"
              alt="UniFinance"
              className="h-12 w-auto mb-1"
              style={{ filter: "hue-rotate(70deg) saturate(1.2)" }}
            />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              The modern way to track, understand, and grow your money.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} UniFinance. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-destructive fill-destructive" /> for people who take their finances seriously.
          </p>
        </div>
      </div>
    </footer>
  );
}
