"use server";
import { db as prismaDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/get-user";

/* eslint-disable @typescript-eslint/no-explicit-any */
function serializeTransaction(obj: any): any {
  const serialized = { ...obj };

  if (obj.balance && typeof obj.balance === "object" && obj.balance !== null && "toNumber" in obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount && typeof obj.amount === "object" && obj.amount !== null && "toNumber" in obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function createAccount(data: any) {
  try {
    const User = await getOrCreateUser();

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance Ammount");
    }

    const existingAccount = await prismaDb.account.findMany({
      where: {
        userId: User.id,
      },
    });

    const shouldBeDefault =
      existingAccount.length === 0 ? true : data.isdefault;

    if (shouldBeDefault) {
      await prismaDb.account.updateMany({
        where: {
          userId: User.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const account = await prismaDb.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: User.id,
        isDefault: shouldBeDefault,
      },
    });

    const serializedAccount = serializeTransaction(account);
    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function GetUserAccounts() {
  try {
    const User = await getOrCreateUser();

    const accounts = await prismaDb.account.findMany({
      where: {
        userId: User.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });
    const serializedAccount = accounts.map(serializeTransaction);
    return { success: true, data: serializedAccount };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }

}

export async function getDashboardData() {
  const User = await getOrCreateUser();

  const transactions = await prismaDb.transaction.findMany({
    where: { userId: User.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}
