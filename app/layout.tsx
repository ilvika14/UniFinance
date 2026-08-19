import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/compo/header";
import ThemeProvider from "@/components/ui/theme-provider";
import CommandPalette from "@/components/compo/command-palette";
import KeyboardShortcuts from "@/components/compo/keyboard-shortcuts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UniFinance",
  description: "UniFinance is a full-stack AI Finance Platform designed to help users seamlessly manage their income, expenses, budgets, and overall financial health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          <CommandPalette />
          <KeyboardShortcuts />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
