"use server";
import { db as prismaDb } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { subDays } from "date-fns";

type CategoryItem = {
  name: string;
  range: [number, number];
};

type CategoryType = "INCOME" | "EXPENSE";

const CATEGORIES: Record<CategoryType, CategoryItem[]> = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

function getRandomAmount(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type: CategoryType): { category: string; amount: number } {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

export type SeedResponse =
  | { success: true; message: string }
  | { success: false; error: string };

export async function seedTransactions(): Promise<SeedResponse> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Unauthorized");

    let user = await prismaDb.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
      user = await prismaDb.user.create({
        data: {
          clerkUserId: clerkUser.id,
          name: fullName || clerkUser.username || "Demo User",
          imageUrl: clerkUser.imageUrl ?? "",
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        },
      });
    }

    const existingAccounts = await prismaDb.account.findMany({
      where: { userId: user.id },
    });

    let checkingAccount = existingAccounts.find((a) => a.name === "Main Checking");
    let savingsAccount = existingAccounts.find((a) => a.name === "Savings");

    if (!checkingAccount) {
      checkingAccount = await prismaDb.account.create({
        data: {
          name: "Main Checking",
          type: "CURRENT",
          balance: 0,
          isDefault: true,
          userId: user.id,
        },
      });
    }

    if (!savingsAccount) {
      savingsAccount = await prismaDb.account.create({
        data: {
          name: "Savings",
          type: "SAVINGS",
          balance: 0,
          isDefault: false,
          userId: user.id,
        },
      });
    }

    const transactions: Array<{
      type: CategoryType;
      amount: number;
      description: string;
      date: Date;
      category: string;
      status: string;
      userId: string;
      accountId: string;
      isRecurring: boolean;
      recurringInterval: string | null;
    }> = [];

    let checkingBalance = 0;
    let savingsBalance = 0;

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        const type: CategoryType = Math.random() < 0.35 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        const isSavings = category === "investments" || (type === "INCOME" && Math.random() < 0.2);
        const accountId = isSavings ? savingsAccount.id : checkingAccount.id;

        transactions.push({
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: user.id,
          accountId,
          isRecurring: category === "salary" || category === "housing" || category === "utilities",
          recurringInterval: category === "salary" ? "MONTHLY" : category === "housing" ? "MONTHLY" : category === "utilities" ? "MONTHLY" : null,
        });

        if (accountId === checkingAccount.id) {
          checkingBalance += type === "INCOME" ? amount : -amount;
        } else {
          savingsBalance += type === "INCOME" ? amount : -amount;
        }
      }
    }

    await prismaDb.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.transaction.deleteMany({
        where: { userId: user.id },
      });

      await tx.transaction.createMany({ data: transactions });

      await tx.account.update({
        where: { id: checkingAccount.id },
        data: { balance: checkingBalance },
      });

      await tx.account.update({
        where: { id: savingsAccount.id },
        data: { balance: savingsBalance },
      });

      await tx.budget.upsert({
        where: { userId: user.id },
        update: { amount: 5000 },
        create: { userId: user.id, amount: 5000 },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions, 2 accounts, and 1 budget`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
