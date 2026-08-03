"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-4xl w-full glass rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
        aria-labelledby="not-found-heading"
      >
        <div className="flex-shrink-0 w-full md:w-1/2 flex items-center justify-center">
          <div className="relative">
            <div className="text-[120px] font-bold text-muted/80 leading-none">404</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-primary text-2xl font-bold">?</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <h1 id="not-found-heading" className="text-4xl sm:text-5xl font-bold text-foreground">Page not found</h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            We can&apos;t find the page you&apos;re looking for. It might have been moved or deleted, or maybe the URL is misspelled.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button className="gradient text-white rounded-xl glow-emerald px-6">Go back home</Button>
            </Link>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            <p>Tip: If you typed the web address manually, double-check for typos.</p>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default NotFoundPage;
