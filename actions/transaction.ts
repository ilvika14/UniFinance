"use server";

import { db as prismaDb } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next"
import { aj } from "@/lib/arcjet";
import { GoogleGenAI } from "@google/genai";
import { getOrCreateUser } from "@/lib/get-user";

export type FormDataTransaction = {
  type: "INCOME" | "EXPENSE";
  amount: string;
  date: Date;
  accountId: string;
  category: string;
  description?: string;
  isRecurring?: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
};


const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const serializeAmount = (obj: Record<string, unknown>) => ({
  ...obj,
  amount: typeof obj.amount === "object" && obj.amount !== null && "toNumber" in obj.amount
    ? (obj.amount as { toNumber: () => number }).toNumber()
    : Number(obj.amount),
});

export async function createTransaction(data: FormDataTransaction) {
  try {
    const user = await getOrCreateUser();

    const { userId } = await import("@clerk/nextjs/server").then(m => m.auth());

    const req = await request()

    const decision = await aj.protect(req, {
      userId: userId!,
      requested: 1
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          }
        })
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error("Request denied.");
    }

    const account = await prismaDb.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const balanceChange = data.type === "EXPENSE" ? -parseFloat(data.amount) : parseFloat(data.amount);
    const newBalance = Number(account.balance) + balanceChange;

    const transaction = await prismaDb.$transaction(async (tx: Prisma.TransactionClient) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: parseFloat(data.amount),
          date: data.date,
          accountId: data.accountId,
          category: data.category,
          description: data.description,
          isRecurring: data.isRecurring ?? false,
          recurringInterval: data.recurringInterval ?? null,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate({ startDate: data.date, interval: data.recurringInterval })
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}


function calculateNextRecurringDate({ startDate, interval }: { startDate: Date, interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" }) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

export async function scanReceipt(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file provided");

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (number only)
      - Date (ISO string)
      - Description (short summary)
      - Merchant/store name
      - Suggested category from: housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense

      Respond ONLY with JSON:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }
    `;

    console.log("Gemini API key present:", !!process.env.GEMINI_API_KEY);
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64String,
                mimeType: file.type || "image/jpeg",
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    const responseText = result.text;

    const cleanedText = (responseText || "")
      .replace(/```json|```/g, "")
      .trim();

    const json = JSON.parse(cleanedText);

    return {
      amount: Number(json.amount),
      date: new Date(json.date),
      description: json.description,
      category: json.category,
      merchantName: json.merchantName,
    };
  } catch (error) {
    console.error("Error scanning receipt:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to scan receipt: ${message}`);
  }
}

export async function getTransaction(id: string) {
  const user = await getOrCreateUser();

  const transaction = await prismaDb.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id: string, data: FormDataTransaction) {
  try {
    const user = await getOrCreateUser();

    const originalTransaction = await prismaDb.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -Number(originalTransaction.amount)
        : Number(originalTransaction.amount);

    const newBalanceChange =
      data.type === "EXPENSE" ? -parseFloat(data.amount) : parseFloat(data.amount);

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    const transaction = await prismaDb.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          type: data.type,
          amount: parseFloat(data.amount),
          date: data.date,
          accountId: data.accountId,
          category: data.category,
          description: data.description,
          isRecurring: data.isRecurring ?? false,
          recurringInterval: data.recurringInterval ?? null,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate({ startDate: data.date, interval: data.recurringInterval })
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getUserTransactions(query = {}) {
  try {
    const user = await getOrCreateUser();

    const transactions = await prismaDb.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
