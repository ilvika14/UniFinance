"use client";

import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/usefetch";
import { analyzeCsv, importTransactions } from "@/actions/transaction";
import { CsvPreviewTable, type PreviewRow } from "./csv-preview-table";

type Account = { id: string; name: string; balance: number | string; isDefault?: boolean };
type Category = { id: string; name: string; type: string };

interface Props {
  accounts: Account[];
  categories: Category[];
}

type Step = "upload" | "preview" | "done";

type AnalyzeResult = {
  success: boolean;
  data?: {
    rows?: Array<{
      date: string;
      amount: string | number;
      type: string;
      description: string;
      category: string;
    }>;
  };
  error?: string;
};

type ImportResult = {
  success: boolean;
  imported?: number;
  error?: string;
};

export function CsvImporter({ accounts, categories }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id ?? ""
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const { fn: analyzeFn, loading: analyzing, data: analyzeData, setData: setAnalyzeData } = useFetch<[string, Category[]], AnalyzeResult>(analyzeCsv);
  const { fn: importFn, loading: importing, data: importData, setData: setImportData } = useFetch<[FormDataTransaction[], string], ImportResult>(importTransactions);

  type FormDataTransaction = {
    type: "INCOME" | "EXPENSE";
    amount: string;
    date: Date;
    accountId: string;
    category: string;
    description?: string;
  };

  useEffect(() => {
    if (!analyzeData || analyzing) return;

    if (!analyzeData.success) {
      toast.error(analyzeData.error || "Failed to analyze CSV");
      setAnalyzeData(undefined);
      return;
    }

    const csvRows = (window as unknown as { __csvRawRows?: Record<string, string>[] }).__csvRawRows ?? [];
    const aiRows = analyzeData.data?.rows ?? [];

    const mappedRows: PreviewRow[] = csvRows.map(
      (rawRow: Record<string, string>, index: number) => {
        const aiRow = aiRows[index];
        return {
          id: index,
          date: aiRow?.date ?? "",
          amount: aiRow?.amount?.toString() ?? "",
          type: (aiRow?.type === "INCOME" ? "INCOME" : "EXPENSE") as "INCOME" | "EXPENSE",
          description: aiRow?.description ?? "",
          category: aiRow?.category ?? "other-expense",
          originalRow: rawRow,
        };
      }
    );

    setRows(mappedRows);
    setStep("preview");
    toast.success(`Analyzed ${mappedRows.length} transactions`);
    setAnalyzeData(undefined);
  }, [analyzeData, analyzing, setAnalyzeData]);

  useEffect(() => {
    if (!importData || importing) return;

    if (!importData.success) {
      toast.error(importData.error || "Failed to import transactions");
      setImportData(undefined);
      return;
    }

    toast.success(`Successfully imported ${importData.imported} transactions`);
    setStep("done");
    setImportData(undefined);
  }, [importData, importing, setImportData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          toast.error("CSV file is empty");
          return;
        }

        (window as unknown as { __csvRawRows: Record<string, string>[] }).__csvRawRows = result.data as Record<string, string>[];

        const csvText = Papa.unparse(result.data.slice(0, 5));
        analyzeFn(csvText, categories);
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  };

  const handleImport = () => {
    if (rows.length === 0) {
      toast.error("No transactions to import");
      return;
    }

    const validRows = rows.filter((r) => {
      const amount = parseFloat(r.amount);
      const date = new Date(r.date);
      return !isNaN(amount) && amount > 0 && !isNaN(date.getTime());
    });

    if (validRows.length === 0) {
      toast.error("No valid transactions to import. Check that amounts and dates are filled in.");
      return;
    }

    if (validRows.length < rows.length) {
      toast.warning(`Skipping ${rows.length - validRows.length} row(s) with missing or invalid amount/date.`);
    }

    const transactions = validRows.map((r) => ({
      type: r.type as "INCOME" | "EXPENSE",
      amount: r.amount,
      date: new Date(r.date),
      accountId: selectedAccountId,
      category: r.category,
      description: r.description,
    }));

    importFn(transactions, selectedAccountId);
  };

  const reset = () => {
    setStep("upload");
    setRows([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (step === "done") {
    return (
      <div className="text-center py-8">
        <div className="text-green-500 text-lg font-semibold mb-2">Import Complete!</div>
        <p className="text-sm text-muted-foreground mb-4">
          Your transactions have been added.
        </p>
        <Button variant="outline" onClick={reset} className="rounded-xl">
          Import Another File
        </Button>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{rows.length} transactions found</p>
            <p className="text-xs text-muted-foreground">Review and edit before importing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset} className="rounded-xl">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={importing || rows.length === 0}
              className="gradient text-white rounded-xl"
            >
              {importing ? (
                <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Importing...</>
              ) : (
                <>Import {rows.length} Transactions</>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Import to account</label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full h-9 px-3 text-sm bg-muted border border-border rounded-xl"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} - ₹{Number(a.balance).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-border rounded-xl overflow-hidden max-h-96 overflow-y-auto">
          <CsvPreviewTable rows={rows} categories={categories} onRowsChange={setRows} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileSelect}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={analyzing}
        className="w-full flex items-center gap-3 px-4 py-3 border border-border bg-card hover:bg-muted text-foreground text-sm font-medium transition-all duration-300 rounded-xl"
      >
        {analyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing CSV with AI...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Upload CSV File</span>
          </>
        )}
      </button>
      <p className="text-xs text-muted-foreground mt-2">
        Upload a CSV file from your bank. AI will auto-detect columns and categorize transactions.
      </p>
    </div>
  );
}
