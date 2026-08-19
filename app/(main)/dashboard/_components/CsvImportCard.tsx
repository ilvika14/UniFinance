"use client";

import { CsvImporter } from "@/app/(main)/transactions/_components/csv-importer";
import { Upload } from "lucide-react";

type Account = { id: string; name: string; balance: number | string; isDefault?: boolean };
type Category = { id: string; name: string; type: string };

interface Props {
  accounts: Account[];
  categories: Category[];
}

export default function CsvImportCard({ accounts, categories }: Props) {
  return (
    <div className="glass rounded-xl p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Upload className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Import Bank CSV</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI-powered import</p>
        </div>
      </div>
      <CsvImporter accounts={accounts} categories={categories} />
    </div>
  );
}
