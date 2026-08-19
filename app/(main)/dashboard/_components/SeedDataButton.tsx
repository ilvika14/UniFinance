"use client";

import { useState } from "react";
import { seedSampleData } from "@/actions/seed";
import { toast } from "sonner";
import { Database, Loader2, CheckCircle2 } from "lucide-react";

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const result = await seedSampleData();
      if (result.success) {
        toast.success(`Imported ${result.imported} sample transactions`);
        setDone(true);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to seed data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading || done}
      className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-all text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {done ? "Data Imported" : "Load Sample Data"}
    </button>
  );
}
