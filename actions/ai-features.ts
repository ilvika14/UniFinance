"use server";

import { db as prismaDb } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/get-user";
import { generateContentWithRetry } from "@/lib/grok-retry";

type TransactionRow = {
  id: string;
  type: string;
  amount: number | { toNumber: () => number };
  description: string | null;
  date: Date | string;
  category: string;
  isRecurring: boolean;
  accountId: string;
};

function toNum(v: number | { toNumber: () => number }): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "toNumber" in v) return v.toNumber();
  return 0;
}

function subMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

// ─── Feature 1: AI Monthly Briefing ────────────────────────────────────────

export type AIBriefing = {
  summary: string;
  incomeChange: number;
  expenseChange: number;
  topInsight: string;
  incomeAmount: number;
  expenseAmount: number;
  netAmount: number;
};

export type DetailedBriefing = {
  currentMonth: {
    name: string;
    income: number;
    expenses: number;
    net: number;
    transactionCount: number;
    avgTransaction: number;
  };
  previousMonth: {
    name: string;
    income: number;
    expenses: number;
    net: number;
  };
  changes: {
    incomePct: number;
    expensePct: number;
    netPct: number;
  };
  categoryBreakdown: { category: string; amount: number; pct: number; trend: "up" | "down" | "same" }[];
  topExpenses: { description: string; amount: number; category: string; date: string }[];
  recurringTotal: number;
  recurringIncomeTotal: number;
  savingsRate: number;
  insights: string[];
  healthScore: number;
  healthLabel: string;
  recommendations: string[];
};

async function getMonthTransactions(userId: string, date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return prismaDb.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
  }) as Promise<TransactionRow[]>;
}

export async function getDetailedBriefing(): Promise<{ success: boolean; data?: DetailedBriefing; error?: string }> {
  try {
    const user = await getOrCreateUser();
    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });
    const prevMonthName = subMonths(now, 1).toLocaleString("default", { month: "long" });

    const [currentTxns, prevTxns] = await Promise.all([
      getMonthTransactions(user.id, now),
      getMonthTransactions(user.id, subMonths(now, 1)),
    ]);

    // Current month stats
    let income = 0, expenses = 0, recurringTotal = 0, recurringIncomeTotal = 0;
    const byCategory: Record<string, number> = {};

    for (const t of currentTxns) {
      const amt = toNum(t.amount);
      if (t.type === "INCOME") {
        income += amt;
        if (t.isRecurring) recurringIncomeTotal += amt;
      } else {
        expenses += amt;
        byCategory[t.category] = (byCategory[t.category] || 0) + amt;
        if (t.isRecurring) recurringTotal += amt;
      }
    }

    // Previous month stats
    let prevIncome = 0, prevExpenses = 0;
    for (const t of prevTxns) {
      const amt = toNum(t.amount);
      if (t.type === "INCOME") prevIncome += amt;
      else prevExpenses += amt;
    }

    const net = income - expenses;
    const prevNet = prevIncome - prevExpenses;
    const avgTransaction = currentTxns.length > 0 ? expenses / currentTxns.filter(t => t.type === "EXPENSE").length : 0;

    const incomePct = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
    const expensePct = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
    const netPct = prevNet !== 0 ? ((net - prevNet) / Math.abs(prevNet)) * 100 : 0;

    // Category breakdown with trends
    const prevByCategory: Record<string, number> = {};
    for (const t of prevTxns) {
      if (t.type === "EXPENSE") {
        const amt = toNum(t.amount);
        prevByCategory[t.category] = (prevByCategory[t.category] || 0) + amt;
      }
    }

    const categoryBreakdown = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => {
        const prevAmt = prevByCategory[category] || 0;
        let trend: "up" | "down" | "same" = "same";
        if (amount > prevAmt * 1.1) trend = "up";
        else if (amount < prevAmt * 0.9) trend = "down";
        return { category, amount, pct: expenses > 0 ? (amount / expenses) * 100 : 0, trend };
      });

    // Top 5 expenses
    const topExpenses = currentTxns
      .filter(t => t.type === "EXPENSE")
      .sort((a, b) => toNum(b.amount) - toNum(a.amount))
      .slice(0, 5)
      .map(t => ({
        description: t.description || "Unknown",
        amount: toNum(t.amount),
        category: t.category,
        date: new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      }));

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Health score (0-100)
    let healthScore = 50;
    if (savingsRate > 20) healthScore += 20;
    else if (savingsRate > 10) healthScore += 10;
    else if (savingsRate < 0) healthScore -= 20;

    if (expensePct < 0) healthScore += 15;
    else if (expensePct > 20) healthScore -= 15;

    if (incomePct > 0) healthScore += 10;
    else if (incomePct < -10) healthScore -= 10;

    if (recurringTotal < expenses * 0.3) healthScore += 5;

    healthScore = Math.max(0, Math.min(100, healthScore));

    let healthLabel = "Needs Attention";
    if (healthScore >= 80) healthLabel = "Excellent";
    else if (healthScore >= 60) healthLabel = "Good";
    else if (healthScore >= 40) healthLabel = "Fair";

    // AI insights
    const categoryList = categoryBreakdown.slice(0, 5).map(c => `${c.category}: ₹${c.amount.toFixed(0)} (${c.pct.toFixed(1)}%)`).join(", ");
    const topList = topExpenses.map(e => `${e.description} ₹${e.amount.toFixed(0)}`).join(", ");

    const prompt = `You are a friendly Indian financial advisor. Analyze this monthly financial data and provide 3-4 concise, actionable insights. Be specific with numbers. Use ₹ symbol. Keep each insight 1-2 sentences.

Data for ${monthName}:
- Income: ₹${income.toFixed(0)} (${incomePct >= 0 ? "+" : ""}${incomePct.toFixed(1)}% vs ${prevMonthName})
- Expenses: ₹${expenses.toFixed(0)} (${expensePct >= 0 ? "+" : ""}${expensePct.toFixed(1)}% vs ${prevMonthName})
- Net Savings: ₹${net.toFixed(0)}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Recurring expenses: ₹${recurringTotal.toFixed(0)} (${expenses > 0 ? ((recurringTotal / expenses) * 100).toFixed(1) : 0}% of total)
- Recurring income: ₹${recurringIncomeTotal.toFixed(0)} (${income > 0 ? ((recurringIncomeTotal / income) * 100).toFixed(1) : 0}% of total)
- Top spending categories: ${categoryList || "None"}
- Top 5 expenses: ${topList || "None"}
- Transaction count: ${currentTxns.length}

Reply as a JSON array of strings: ["insight1", "insight2", "insight3"]
Only the JSON array, nothing else.`;

    const aiResult = await generateContentWithRetry("llama-3.3-70b-versatile", prompt);
    const raw = (aiResult || "").replace(/<think>[\s\S]*?<\/think>/gi, "");
    const arrayStart = raw.indexOf("[");
    const arrayEnd = raw.lastIndexOf("]");
    let insights: string[] = [];
    try {
      insights = arrayStart !== -1 && arrayEnd !== -1
        ? JSON.parse(raw.substring(arrayStart, arrayEnd + 1))
        : [];
    } catch {
      insights = ["Your finances are looking steady this month."];
    }

    // Recommendations
    const recommendations: string[] = [];
    if (savingsRate < 20) recommendations.push("Try to save at least 20% of your income. Consider setting up automatic transfers.");
    if (recurringIncomeTotal > 0 && recurringIncomeTotal < income * 0.5) recommendations.push("Your recurring income covers less than 50% of total income. Consider diversifying with more stable income streams.");
    if (recurringTotal > expenses * 0.4) recommendations.push("Recurring subscriptions are a large portion of expenses. Review and cancel unused ones.");
    if (expensePct > 15) recommendations.push("Expenses jumped significantly from last month. Review your top categories for savings opportunities.");
    if (incomePct < -5) recommendations.push("Income dropped from last month. Consider diversifying income streams.");
    if (categoryBreakdown.length > 0 && categoryBreakdown[0].pct > 30) {
      recommendations.push(`${categoryBreakdown[0].category} takes ${categoryBreakdown[0].pct.toFixed(0)}% of your spending. Look for ways to reduce this.`);
    }
    if (recommendations.length === 0) {
      recommendations.push("Great job! Your finances are well-balanced. Keep maintaining this discipline.");
    }

    return {
      success: true,
      data: {
        currentMonth: {
          name: monthName,
          income,
          expenses,
          net,
          transactionCount: currentTxns.length,
          avgTransaction,
        },
        previousMonth: {
          name: prevMonthName,
          income: prevIncome,
          expenses: prevExpenses,
          net: prevNet,
        },
        changes: {
          incomePct: Math.round(incomePct * 10) / 10,
          expensePct: Math.round(expensePct * 10) / 10,
          netPct: Math.round(netPct * 10) / 10,
        },
        categoryBreakdown,
        topExpenses,
        recurringTotal,
        recurringIncomeTotal,
        savingsRate: Math.round(savingsRate * 10) / 10,
        insights,
        healthScore,
        healthLabel,
        recommendations,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ─── Legacy briefing for dashboard card ────────────────────────────────────

export async function getAIBriefing(): Promise<{ success: boolean; data?: AIBriefing; error?: string }> {
  try {
    const result = await getDetailedBriefing();
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const d = result.data;
    return {
      success: true,
      data: {
        summary: `${d.currentMonth.transactionCount} transactions this month`,
        incomeChange: d.changes.incomePct,
        expenseChange: d.changes.expensePct,
        topInsight: d.insights[0] || "Your finances are looking steady this month.",
        incomeAmount: d.currentMonth.income,
        expenseAmount: d.currentMonth.expenses,
        netAmount: d.currentMonth.net,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ─── Feature 2: Spending Anomaly Detection ─────────────────────────────────

export type SpendingAlert = {
  id: string;
  type: "price_hike" | "duplicate" | "unusual_activity";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  amount?: number;
  merchant?: string;
  transactionIds: string[];
};

export async function detectSpendingAnomalies(): Promise<{ success: boolean; data?: SpendingAlert[]; error?: string }> {
  try {
    const user = await getOrCreateUser();
    const now = new Date();
    const threeMonthsAgo = subMonths(now, 3);
    const oneWeekAgo = subMonths(now, 0);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const transactions = (await prismaDb.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: threeMonthsAgo },
      },
      orderBy: { date: "desc" },
    })) as TransactionRow[];

    const alerts: SpendingAlert[] = [];

    // ── Duplicate Detection ──
    const recentTxns = transactions.filter((t) => new Date(t.date) >= oneWeekAgo);
    const seen = new Map<string, TransactionRow[]>();

    for (const t of recentTxns) {
      const desc = (t.description || "").toLowerCase().trim();
      const amt = toNum(t.amount);
      const key = `${desc}|${amt.toFixed(2)}`;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(t);
    }

    for (const [, group] of seen) {
      if (group.length < 2) continue;
      for (let i = 0; i < group.length - 1; i++) {
        const a = group[i];
        const b = group[i + 1];
        const diff = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime());
        if (diff < 5 * 60 * 1000) {
          alerts.push({
            id: `dup-${a.id}-${b.id}`,
            type: "duplicate",
            severity: "high",
            title: `Duplicate charge detected`,
            description: `${a.description || "Transaction"} ($${toNum(a.amount).toFixed(2)}) processed twice within ${Math.round(diff / 1000)}s`,
            amount: toNum(a.amount),
            merchant: a.description || undefined,
            transactionIds: [a.id, b.id],
          });
        }
      }
    }

    // ── Price Hike Detection ──
    const MERCHANT_KEYWORDS: Record<string, string[]> = {
      Netflix: ["netflix"], Spotify: ["spotify"], AWS: ["aws", "amazon web"],
      Adobe: ["adobe"], Figma: ["figma"], GitHub: ["github"],
      Google: ["google"], Microsoft: ["microsoft"], Zoom: ["zoom"],
      Slack: ["slack"], Dropbox: ["dropbox"], Notion: ["notion"],
      "Apple Store": ["apple", "itunes"], Amazon: ["amazon"],
    };

    function matchMerchant(desc: string): string {
      const lower = (desc || "").toLowerCase();
      for (const [merchant, keywords] of Object.entries(MERCHANT_KEYWORDS)) {
        if (keywords.some((k) => lower.includes(k))) return merchant;
      }
      return "";
    }

    const merchantTxns = new Map<string, TransactionRow[]>();
    for (const t of transactions) {
      const merchant = matchMerchant(t.description || "");
      if (!merchant) continue;
      if (!merchantTxns.has(merchant)) merchantTxns.set(merchant, []);
      merchantTxns.get(merchant)!.push(t);
    }

    for (const [merchant, txns] of merchantTxns) {
      if (txns.length < 3) continue;
      const sorted = [...txns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const historical = sorted.slice(0, -1);
      const current = sorted[sorted.length - 1];

      const avgHistorical = historical.reduce((s, t) => s + toNum(t.amount), 0) / historical.length;
      const currentAmt = toNum(current.amount);

      if (avgHistorical > 0 && currentAmt > avgHistorical * 1.3) {
        const pctIncrease = ((currentAmt - avgHistorical) / avgHistorical * 100).toFixed(0);
        alerts.push({
          id: `hike-${merchant}`,
          type: "price_hike",
          severity: Number(pctIncrease) > 100 ? "high" : "medium",
          title: `${merchant} price increase detected`,
          description: `${merchant} billed $${currentAmt.toFixed(2)} — a ${pctIncrease}% surge vs your 3-month average ($${avgHistorical.toFixed(2)}/mo)`,
          amount: currentAmt,
          merchant,
          transactionIds: [current.id],
        });
      }
    }

    // ── Unusual Activity Detection ──
    const monthlyExpenses: number[] = [];
    for (let i = 0; i < 3; i++) {
      const mStart = startOfMonth(subMonths(now, i + 1));
      const mEnd = endOfMonth(subMonths(now, i + 1));
      const monthTotal = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return d >= mStart && d <= mEnd;
        })
        .reduce((s, t) => s + toNum(t.amount), 0);
      monthlyExpenses.push(monthTotal);
    }

    const avgMonthly = monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length;
    const stdDev = Math.sqrt(
      monthlyExpenses.reduce((s, v) => s + Math.pow(v - avgMonthly, 2), 0) / monthlyExpenses.length
    );

    const currentMonthStart = startOfMonth(now);
    const currentMonthTotal = transactions
      .filter((t) => new Date(t.date) >= currentMonthStart)
      .reduce((s, t) => s + toNum(t.amount), 0);

    if (avgMonthly > 0 && stdDev > 0 && currentMonthTotal > avgMonthly + 2 * stdDev) {
      alerts.push({
        id: "unusual-activity",
        type: "unusual_activity",
        severity: "high",
        title: "Unusual spending activity",
        description: `Your spending this month ($${currentMonthTotal.toFixed(2)}) is significantly higher than your 3-month average ($${avgMonthly.toFixed(2)})`,
        amount: currentMonthTotal,
        transactionIds: [],
      });
    }

    return { success: true, data: alerts };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ─── Feature 3: Subscription Audit ─────────────────────────────────────────

export type SubscriptionItem = {
  merchant: string;
  amount: number;
  frequency: string;
  lastUsed: Date | null;
  status: "active" | "unused" | "price_increased";
  daysSinceLastUsed: number | null;
  totalSpent: number;
  transactionCount: number;
};

export async function getSubscriptionAudit(): Promise<{ success: boolean; data?: SubscriptionItem[]; error?: string }> {
  try {
    const user = await getOrCreateUser();

    const transactions = (await prismaDb.transaction.findMany({
      where: { userId: user.id, type: "EXPENSE" },
      orderBy: { date: "desc" },
    })) as TransactionRow[];

    const MERCHANT_KEYWORDS: Record<string, string[]> = {
      Netflix: ["netflix"], Spotify: ["spotify"], AWS: ["aws", "amazon web"],
      Adobe: ["adobe"], Figma: ["figma"], GitHub: ["github"],
      Google: ["google"], Microsoft: ["microsoft"], Zoom: ["zoom"],
      Slack: ["slack"], Dropbox: ["dropbox"], Notion: ["notion"],
      "Apple Store": ["apple", "itunes"],
    };

    function matchMerchant(desc: string): string {
      const lower = (desc || "").toLowerCase();
      for (const [merchant, keywords] of Object.entries(MERCHANT_KEYWORDS)) {
        if (keywords.some((k) => lower.includes(k))) return merchant;
      }
      return "";
    }

    const merchantMap = new Map<string, {
      amounts: number[];
      lastDate: Date | null;
      total: number;
      count: number;
      allDates: Date[];
    }>();

    for (const t of transactions) {
      const merchant = matchMerchant(t.description || "");
      if (!merchant) continue;

      if (!merchantMap.has(merchant)) {
        merchantMap.set(merchant, { amounts: [], lastDate: null, total: 0, count: 0, allDates: [] });
      }
      const entry = merchantMap.get(merchant)!;
      const amt = toNum(t.amount);
      entry.amounts.push(amt);
      entry.total += amt;
      entry.count += 1;
      entry.allDates.push(new Date(t.date));
      if (!entry.lastDate || new Date(t.date) > entry.lastDate) {
        entry.lastDate = new Date(t.date);
      }
    }

    const now = new Date();
    const items: SubscriptionItem[] = [];

    for (const [merchant, data] of merchantMap) {
      if (data.amounts.length < 2) continue;

      const daysSinceLastUsed = data.lastDate
        ? Math.floor((now.getTime() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
      const latestAmount = data.amounts[0];
      const priceIncreased = latestAmount > avgAmount * 1.15;

      let status: "active" | "unused" | "price_increased" = "active";
      if (priceIncreased) status = "price_increased";
      else if (daysSinceLastUsed !== null && daysSinceLastUsed > 45) status = "unused";

      let frequency = "Monthly";
      if (data.allDates.length >= 2) {
        const sorted = [...data.allDates].sort((a, b) => a.getTime() - b.getTime());
        const intervals: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
          intervals.push(sorted[i].getTime() - sorted[i - 1].getTime());
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const avgDays = avgInterval / (1000 * 60 * 60 * 24);
        if (avgDays < 2) frequency = "Daily";
        else if (avgDays < 10) frequency = "Weekly";
        else if (avgDays < 40) frequency = "Monthly";
        else frequency = "Yearly";
      }

      items.push({
        merchant,
        amount: latestAmount,
        frequency,
        lastUsed: data.lastDate,
        status,
        daysSinceLastUsed,
        totalSpent: data.total,
        transactionCount: data.count,
      });
    }

    items.sort((a, b) => {
      const statusOrder = { price_increased: 0, unused: 1, active: 2 };
      return statusOrder[a.status] - statusOrder[b.status] || b.totalSpent - a.totalSpent;
    });

    return { success: true, data: items };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
