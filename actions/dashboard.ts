"use server";
import { db as prismaDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/get-user";
import { serializeAmount } from "@/lib/utils";

export async function createAccount(data: {
  name: string;
  type: string;
  balance: string;
  currency?: string;
  isDefault?: boolean;
}) {
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
      existingAccount.length === 0 ? true : data.isDefault;

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

    const serializedAccount = serializeAmount(account);
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
    const serializedAccount = accounts.map(serializeAmount);
    return { success: true, data: serializedAccount };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }

}

export async function getDashboardData() {
  try {
    const User = await getOrCreateUser();

    const transactions = await prismaDb.transaction.findMany({
      where: { userId: User.id },
      orderBy: { date: "desc" },
    });

    return { success: true, data: transactions.map(serializeAmount) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message, data: [] };
  }
}
