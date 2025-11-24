"use client";

import { useState } from "react";
import { ReceiptCard } from "./receipt-card";
import { ReceiptDrawer } from "./receipt-drawer";

interface Expense {
  id: number;
  merchantName: string | null;
  amount: string;
  currency: string;
  category: string;
  date: Date | null;
  description: string | null;
  confidence: string | null;
  createdAt: Date;
}

interface Receipt {
  id: number;
  imageUrl: string | null;
  uploadedAt: Date;
  processedAt: Date | null;
  status: string;
  expenses: Expense[];
}

interface ReceiptsListProps {
  receipts: Receipt[];
}

export function ReceiptsList({ receipts }: ReceiptsListProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleReceiptClick = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDrawerOpen(true);
  };

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="text-6xl mb-4">🧾</div>
        <h2 className="text-2xl font-light mb-2">No Receipts Yet</h2>
        <p className="text-muted-foreground mb-6">
          Upload your first receipt using the + button below to start tracking
          your expenses!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-2">
        {receipts.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            onClick={() => handleReceiptClick(receipt)}
          />
        ))}
      </div>
      <ReceiptDrawer
        receipt={selectedReceipt}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
