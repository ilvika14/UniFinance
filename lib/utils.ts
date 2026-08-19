import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateNextRecurringDate(
  startDate: Date,
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
): Date {
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

export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value && typeof (value as { toNumber: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}

export function serializeAmount<T extends Record<string, unknown>>(obj: T): T {
  const serialized = { ...obj };
  if ("amount" in serialized) {
    (serialized as Record<string, unknown>).amount = toNumber(serialized.amount);
  }
  if ("balance" in serialized) {
    (serialized as Record<string, unknown>).balance = toNumber(serialized.balance);
  }
  return serialized;
}
