"use server";
import { db as prismaDb } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/get-user";
import { serializeAmount } from "@/lib/utils";

export async function updateDefaultAccount(accountId: string) {
  try {
    const User = await getOrCreateUser();

    await prismaDb.account.updateMany({
      where: {
        userId: User.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const account = await prismaDb.account.update({
      where: {
        id: accountId,
      },
      data: {
        isDefault: true,
      },
    });

    revalidatePath("/dashboard");
    const serializedAccount = serializeAmount(account);
    return { success: true, data: serializedAccount };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getAccountWithTransaction(accountId: string) {
  const User = await getOrCreateUser();

  const account = await prismaDb.account.findUnique({
    where: {
      id: accountId,
      userId: User.id,
    },
    include: {
      transactions: {
        orderBy: {
          date: "desc",
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!account) {
    return null;
  }

  const serialized = serializeAmount(account);
  const serializedTransactions = account.transactions.map((t) => serializeAmount(t));

  return {
    ...serialized,
    transactions: serializedTransactions,
  };
}

export async function bulkDeleteTransactions(transactionIds: string[]) {
  try {
    const User = await getOrCreateUser();

    const transactions = await prismaDb.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: User.id,
      },
    });

    const accountBalanceChanges: Record<string, number> = {};

    for (const t of transactions) {
      const amount = Number(t.amount);

      const change = t.type === "INCOME" ? -amount : amount;

      accountBalanceChanges[t.accountId] =
        (accountBalanceChanges[t.accountId] || 0) + change;
    }

    await prismaDb.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.transaction.deleteMany({
        where: { id: { in: transactionIds }, userId: User.id },
      });

      for (const [accountId, change] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: { increment: change },
          },
        });
      }
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
