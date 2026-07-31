import React from 'react'
import AddTransactionForm from '../_components/transaction-form'
import { GetUserAccounts } from '@/actions/dashboard';
import { defaultCategories } from '@/data/category';
import { getTransaction } from '@/actions/transaction';


export default async function AddTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ [edit: string]: string | string[]  }>
}) {
  const filters = (await searchParams)


  const data = await GetUserAccounts();
  const accounts = data?.data ?? [];   

  const editId = Array.isArray(filters.edit) ? filters.edit[0] : filters.edit;
 

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction as unknown as {
      type: string;
      amount: string | number;
      description?: string;
      accountId: string;
      category: string;
      date: string | Date;
      isRecurring?: boolean;
      recurringInterval?: string;
    } | null;
  }

  return (
    <div className="max-w-3xl mx-auto mt-5 px-5">

      <AddTransactionForm
        accounts={accounts}
        category={defaultCategories as Array<{ id: string; name: string; type: "INCOME" | "EXPENSE" }>}
        editMode={Boolean(editId)}
        initialData={initialData}
      />
    </div>
  );
}
