"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PreviewRow = {
  id: number;
  date: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  category: string;
  originalRow: Record<string, string>;
};

type Category = { id: string; name: string; type: string };

interface Props {
  rows: PreviewRow[];
  categories: Category[];
  onRowsChange: (rows: PreviewRow[]) => void;
}

export function CsvPreviewTable({ rows, categories, onRowsChange }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<PreviewRow>>({});

  const handleDelete = (id: number) => {
    onRowsChange(rows.filter((r) => r.id !== id));
  };

  const startEdit = (row: PreviewRow) => {
    setEditingId(row.id);
    setEditValues({
      date: row.date,
      amount: row.amount,
      type: row.type,
      description: row.description,
      category: row.category,
    });
  };

  const saveEdit = (id: number) => {
    onRowsChange(
      rows.map((r) => (r.id === id ? { ...r, ...editValues } : r))
    );
    setEditingId(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const updateField = (field: keyof PreviewRow, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const filteredCategories = categories.filter(
    (c) => c.type === (editingId !== null ? editValues.type : undefined)
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Amount</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30">
              {editingId === row.id ? (
                <>
                  <td className="px-3 py-2">
                    <Input
                      type="date"
                      value={editValues.date || ""}
                      onChange={(e) => updateField("date", e.target.value)}
                      className="h-8 text-xs bg-muted border-border rounded-lg"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={editValues.amount || ""}
                      onChange={(e) => updateField("amount", e.target.value)}
                      className="h-8 text-xs bg-muted border-border rounded-lg w-24"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select value={editValues.type} onValueChange={(v) => updateField("type", v)}>
                      <SelectTrigger className="h-8 text-xs bg-muted border-border rounded-lg w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-lg">
                        <SelectItem value="EXPENSE" className="rounded-lg">Expense</SelectItem>
                        <SelectItem value="INCOME" className="rounded-lg">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Select value={editValues.category} onValueChange={(v) => updateField("category", v)}>
                      <SelectTrigger className="h-8 text-xs bg-muted border-border rounded-lg w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-lg">
                        {categories
                          .filter((c) => c.type === editValues.type)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={editValues.description || ""}
                      onChange={(e) => updateField("description", e.target.value)}
                      className="h-8 text-xs bg-muted border-border rounded-lg"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(row.id)}>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2 text-xs">{row.date ? format(new Date(row.date), "MMM d, yyyy") : "-"}</td>
                  <td className="px-3 py-2 text-xs font-medium">₹{parseFloat(row.amount).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${row.type === "INCOME" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{categories.find((c) => c.id === row.category)?.name ?? row.category}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground max-w-40 truncate">{row.description}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(row)}>
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
