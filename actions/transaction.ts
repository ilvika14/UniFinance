"use server";

import { db as prismaDb } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next"
import { aj } from "@/lib/arcjet";
import { generateVisionWithRetry, generateContentWithRetry } from "@/lib/grok-retry";
import { getOrCreateUser } from "@/lib/get-user";
import { calculateNextRecurringDate, serializeAmount } from "@/lib/utils";

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


export async function createTransaction(data: FormDataTransaction) {
  try {
    const user = await getOrCreateUser();

    const req = await request()

    const decision = await aj.protect(req, {
      userId: user.id,
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
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
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

    const responseText = await generateVisionWithRetry(
      "qwen/qwen3.6-27b",
      base64String,
      file.type || "image/jpeg",
      prompt
    );

    const raw = (responseText || "").replace(/<think>[\s\S]*?<\/think>/gi, "");
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found in AI response");
    const json = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));

    return {
      success: true as const,
      amount: Number(json.amount),
      date: new Date(json.date),
      description: json.description,
      category: json.category,
      merchantName: json.merchantName,
    };
  } catch (error) {
    console.error("Error scanning receipt:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false as const, error: message };
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

    const accountChanged = data.accountId !== originalTransaction.accountId;

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
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      if (accountChanged) {
        // Reversing old transaction on old account
        await tx.account.update({
          where: { id: originalTransaction.accountId },
          data: { balance: { increment: -oldBalanceChange } },
        });
        // Apply new transaction on new account
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: newBalanceChange } },
        });
      } else {
        // Same account — apply only the net difference
        const netBalanceChange = newBalanceChange - oldBalanceChange;
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: netBalanceChange } },
        });
      }

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${originalTransaction.accountId}`);
    if (accountChanged) {
      revalidatePath(`/account/${data.accountId}`);
    }

    return { success: true, data: serializeAmount(transaction) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getUserTransactions(query: Record<string, unknown> = {}) {
  try {
    const user = await getOrCreateUser();

    const { type, category, accountId, date } = query as {
      type?: string;
      category?: string;
      accountId?: string;
      date?: { gte?: Date; lte?: Date };
    };

    const where: Record<string, unknown> = { userId: user.id };
    if (type) where.type = type;
    if (category) where.category = category;
    if (accountId) where.accountId = accountId;
    if (date) where.date = date;

    const transactions = await prismaDb.transaction.findMany({
      where,
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

export type SearchFilters = {
  query?: string;
  type?: string;
  category?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  pageSize?: number;
};

export async function searchTransactions(filters: SearchFilters) {
  try {
    const user = await getOrCreateUser();
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.TransactionWhereInput = { userId: user.id };

    if (filters.query) {
      where.description = { contains: filters.query, mode: "insensitive" } as Prisma.StringNullableFilter;
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.accountId) {
      where.accountId = filters.accountId;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }
    if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
      where.amount = {};
      if (filters.amountMin !== undefined) where.amount.gte = filters.amountMin;
      if (filters.amountMax !== undefined) where.amount.lte = filters.amountMax;
    }

    const [transactions, total] = await Promise.all([
      prismaDb.transaction.findMany({
        where,
        include: { account: true },
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
      }),
      prismaDb.transaction.count({ where }),
    ]);

    return {
      success: true,
      data: transactions.map(serializeAmount),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export type CsvMappedRow = {
  date: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  category: string;
  originalRow: Record<string, string>;
};

export async function analyzeCsv(
  csvText: string,
  categories: { id: string; name: string; type: string }[]
) {
  try {
    const categoryList = categories
      .map((c) => `${c.id} (${c.name}, ${c.type})`)
      .join(", ");

    const prompt = `You are a financial data analyst. Analyze this CSV data and map each row to a transaction.

CSV content (first 5 rows):
${csvText}

Available categories: ${categoryList}

For EACH row, determine:
1. The date (convert to ISO format YYYY-MM-DD)
2. The amount (positive number only)
3. Whether it's INCOME or EXPENSE (based on column headers, amounts, or descriptions)
4. A short description
5. The best matching category id from the available list

Respond ONLY with a JSON object:
{
  "columnMapping": {
    "date": "column_name_or_null",
    "amount": "column_name_or_null", 
    "description": "column_name_or_null",
    "type": "column_name_or_null"
  },
  "rows": [
    {
      "date": "YYYY-MM-DD",
      "amount": "123.45",
      "type": "EXPENSE",
      "description": "short description",
      "category": "category_id"
    }
  ]
}`;

    const result = await generateContentWithRetry("llama-3.3-70b-versatile", prompt);
    const raw = (result || "").replace(/<think>[\s\S]*?<\/think>/gi, "");
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("No JSON found in AI response. Raw:", raw.substring(0, 500));
      throw new Error("No JSON found in AI response");
    }
    const parsed = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));

    return { success: true as const, data: parsed };
  } catch (error) {
    console.error("Error analyzing CSV:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false as const, error: message };
  }
}

export async function importTransactions(
  transactions: FormDataTransaction[],
  accountId: string
) {
  try {
    const user = await getOrCreateUser();

    const account = await prismaDb.account.findUnique({
      where: { id: accountId, userId: user.id },
    });

    if (!account) throw new Error("Account not found");

    let netBalanceChange = 0;

    const data = transactions
      .filter((t) => {
        const amount = parseFloat(t.amount);
        const date = t.date instanceof Date ? t.date : new Date(t.date);
        return !isNaN(amount) && amount > 0 && !isNaN(date.getTime());
      })
      .map((t) => {
        const amount = parseFloat(t.amount);
        const date = t.date instanceof Date ? t.date : new Date(t.date);
        const balanceChange = t.type === "EXPENSE" ? -amount : amount;
        netBalanceChange += balanceChange;

        return {
          type: t.type,
          amount,
          date,
          accountId,
          category: t.category,
          description: t.description ?? "",
          isRecurring: false,
          userId: user.id,
        };
      });

    await prismaDb.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.transaction.createMany({ data });
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: netBalanceChange } },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);

    return { success: true as const, imported: data.length };
  } catch (error) {
    console.error("Error importing transactions:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false as const, error: message };
  }
}
