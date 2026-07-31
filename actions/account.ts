"use server";
import { db as prismaDb } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/get-user";

interface SerializedAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { transactions: number };
}

interface SerializedTransaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  date: Date | string;
  category: string;
  accountId: string;
  userId: string;
  isRecurring: boolean;
  recurringInterval: string | null;
  nextRecurringDate: Date | null;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

function serializeAccount(obj: Record<string, unknown>): SerializedAccount {
  const serialized = { ...obj } as unknown as SerializedAccount;
  if (obj.balance && typeof obj.balance === "object" && obj.balance !== null && "toNumber" in obj.balance) {
    serialized.balance = (obj.balance as { toNumber: () => number }).toNumber();
  }
  return serialized;
}

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
    const serializedAccount = serializeAccount(account);
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

  const serialized = serializeAccount(account);
  const serializedTransactions: SerializedTransaction[] = account.transactions.map((t) => {
    const s = { ...t } as unknown as SerializedTransaction;
    s.amount = typeof s.amount === "number" ? s.amount : Number(s.amount);
    return s;
  });

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
