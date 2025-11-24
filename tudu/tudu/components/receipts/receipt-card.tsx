"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, Store, DollarSign } from "lucide-react";

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

interface ReceiptCardProps {
  receipt: Receipt;
  onClick?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  lifestyle: "Lifestyle",
  subscriptions: "Subscriptions",
  transportation: "Transportation",
  shopping: "Shopping",
  entertainment: "Entertainment",
  utilities: "Utilities",
  healthcare: "Healthcare",
  other: "Other",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  processed: "default",
  failed: "destructive",
};

export function ReceiptCard({ receipt, onClick }: ReceiptCardProps) {
  const totalAmount = receipt.expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  const merchantName = receipt.expenses[0]?.merchantName || "Unknown Merchant";
  const mainCategory = receipt.expenses[0]?.category || "other";
  const expenseDate = receipt.expenses[0]?.date || receipt.uploadedAt;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer px-4 last:border-0"
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-light text-sm">{merchantName}</p>
          {receipt.status !== "processed" && (
            <Badge
              variant={STATUS_VARIANTS[receipt.status] || "outline"}
              className="text-xs"
            >
              {receipt.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {new Date(expenseDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span>•</span>
          <span>
            {receipt.expenses.length}{" "}
            {receipt.expenses.length === 1 ? "item" : "items"}
          </span>
          <span>•</span>
          <Badge variant="outline" className="text-xs">
            {CATEGORY_LABELS[mainCategory] || mainCategory}
          </Badge>
        </div>
      </div>
      <div className="text-right">
        <p className="text-base font-light">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: receipt.expenses[0]?.currency || "INR",
          }).format(totalAmount)}
        </p>
      </div>
    </div>
  );
}
