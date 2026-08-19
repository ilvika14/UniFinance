"use client";

import { useRef, useEffect, useCallback } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { scanReceipt } from "@/actions/transaction";
import useFetch from "@/hooks/usefetch";
import { motion } from "framer-motion";

// ---- Types ----
interface ScannedData {
  amount?: number | string;
  date?: string | Date;
  description?: string;
  category?: string;
  merchantName?: string;
}

interface ReceiptScannerProps {
  onScanComplete: (data: ScannedData) => void;
}


export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isScanningRef = useRef(false);

  // Assuming scanReceipt returns any (you can refine later)
  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
    error: scanError,
  } = useFetch(scanReceipt);

  const handleReceiptScan = useCallback(async (file: File) => {
    if (isScanningRef.current) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    isScanningRef.current = true;
    const formData = new FormData();
    formData.append("file", file);
    await scanReceiptFn(formData);
  }, [scanReceiptFn]);


// inside ReceiptScanner:
const lastScannedRef = useRef<string | null>(null);

useEffect(() => {
    
  if (scanReceiptLoading) return;

  if (scanError) {
    isScanningRef.current = false;
    toast.error(scanError);
    return;
  }
    
  if (!scannedData) return;

  isScanningRef.current = false;

  const result = scannedData as {
    success: boolean;
    error?: string;
    amount?: number | string;
    date?: string | Date;
    description?: string;
    category?: string;
    merchantName?: string;
  } | null;

  if (!result?.success) {
    toast.error(result?.error || "Failed to scan receipt");
    return;
  }

   const sd = {
    amount: result.amount,
    date: result.date,
    merchantName: result.merchantName,
   };

  // simple deep-check key: if scannedData is an object, you can compare JSON string
  const scannedId = (() => {
    try {
      // Prefer specific stable fields if available (amount+date+merchantName)
      return `${sd?.amount ?? ""}-${sd?.date ?? ""}-${
        sd?.merchantName ?? ""
      }`;
    } catch {
      return JSON.stringify(scannedData);
    }
  })();

  if (lastScannedRef.current === scannedId) {
    // already handled this scan result
    return;
  }

  lastScannedRef.current = scannedId;

  try {
    onScanComplete(result);
    toast.success("Receipt scanned successfully");
  } catch (err) {
    console.error("onScanComplete handler threw:", err);
  }
}, [scanReceiptLoading, scannedData, scanError, onScanComplete]);


  return (

<>

  <input
    type="file"
    ref={fileInputRef}
    className="hidden"
    accept="image/*"
    capture="environment"
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleReceiptScan(file);
    }}
  />

  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    className="flex-1"
  >
    <Button
      type="button"
      className="
        w-full h-12
        gradient shadow-md text-primary-foreground
        hover:opacity-90 transition
        flex items-center justify-center gap-2
      "
      onClick={() => fileInputRef.current?.click()}
      disabled={scanReceiptLoading}
    >
      {scanReceiptLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Scanning Receipt...</span>
        </>
      ) : (
        <>
          <Camera className="h-4 w-4" />
          <span>Scan Receipt with AI</span>
        </>
      )}
    </Button>
  </motion.div>

</>

  );
}
