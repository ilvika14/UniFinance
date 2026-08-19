"use server";

import { db as prismaDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/get-user";
import { dummyTransactions } from "@/data/dummy-data";
import type { Prisma } from "@prisma/client";

export async function seedSampleData() {
  try {
    const user = await getOrCreateUser();

    const account = await prismaDb.account.findFirst({
      where: { userId: user.id },
    });

    if (!account) {
      return {
        success: false,
        error: "No account found. Create an account first.",
      };
    }

    const existingCount = await prismaDb.transaction.count({
      where: { userId: user.id, accountId: account.id },
    });

    if (existingCount > 0) {
      return {
        success: false,
        error: "Account already has transactions. Clear existing data first.",
      };
    }

    let netBalanceChange = 0;

    const data = dummyTransactions.map((t) => {
      const amount = t.amount;
      const balanceChange = t.type === "EXPENSE" ? -amount : amount;
      netBalanceChange += balanceChange;

      return {
        id: `${user.id}_${t.id}`,
        type: t.type,
        amount,
        date: new Date(t.date),
        accountId: account.id,
        category: t.category,
        description: t.description,
        isRecurring: t.isRecurring,
        recurringInterval: t.recurringInterval ?? null,
        userId: user.id,
        status: t.status,
      };
    });

    await prismaDb.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.transaction.createMany({ data });

      await tx.account.update({
        where: { id: account.id },
        data: { balance: { increment: netBalanceChange } },
      });

      const existingBudget = await tx.budget.findUnique({
        where: { userId: user.id },
      });

      if (!existingBudget) {
        await tx.budget.create({
          data: {
            userId: user.id,
            amount: 150000,
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${account.id}`);

    return { success: true, imported: data.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
