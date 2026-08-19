"use server"

import { db as prismaDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/get-user";

export async function getBudgetData(accountId: string) {
  try {
    const User = await getOrCreateUser();

    const budget = await prismaDb.budget.findFirst({
        where:{
            userId:User.id
        }
    });

    const currDate = new Date();
    const startOfMonth = new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        1
    );
    const endOfMonth = new Date(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        0
    );

    const expenses = await prismaDb.transaction.aggregate({
        where:{
            userId:User.id,
            type:'EXPENSE',
            date:{
                gte:startOfMonth,
                lte:endOfMonth
            },accountId,
        },
        _sum:{
            amount:true
        }
    });

     return {
       success: true,
       data: {
         budget: budget ? { ...budget, amount: Number(budget.amount) } : null,
         currentExpenses: expenses._sum.amount
           ? Number(expenses._sum.amount)
           : 0,
       },
     };

} catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function updateBudget(amount: number) {
  try {
    const User = await getOrCreateUser();

    const budget = await prismaDb.budget.upsert({
        where:{
            userId:User.id
        },
        update:{
            amount,
        },
        create:{
            userId:User.id,
            amount
        },
    });

    revalidatePath("/dashboard");
    return {
        success:true,
        data:{...budget,amount:Number(budget.amount) }
    };

} catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
