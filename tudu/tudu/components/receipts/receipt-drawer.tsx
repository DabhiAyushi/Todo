"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Calendar, Store, DollarSign, Image as ImageIcon } from "lucide-react";

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

interface ReceiptDrawerProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ReceiptDrawer({
  receipt,
  open,
  onOpenChange,
}: ReceiptDrawerProps) {
  if (!receipt) return null;

  const totalAmount = receipt.expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  const merchantName = receipt.expenses[0]?.merchantName || "Unknown Merchant";
  const expenseDate = receipt.expenses[0]?.date || receipt.uploadedAt;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-4xl mx-auto">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle>{merchantName}</DrawerTitle>
            <Badge variant={STATUS_VARIANTS[receipt.status] || "outline"}>
              {receipt.status}
            </Badge>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Receipt Image */}
          {receipt.imageUrl && (
            <div className="rounded-lg border overflow-hidden">
              <img
                src={receipt.imageUrl}
                alt="Receipt"
                className="w-full object-contain max-h-[300px]"
              />
            </div>
          )}

          {/* Summary */}
          <div className="space-y-3">
            <h3 className="font-light text-lg">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-light">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: receipt.expenses[0]?.currency || "INR",
                  }).format(totalAmount)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-lg">
                  {new Date(expenseDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Expenses List - Only show if more than one item */}
          {receipt.expenses.length > 1 && (
            <div className="space-y-3">
              <h3 className="font-light text-lg">
                Items ({receipt.expenses.length})
              </h3>
              <div className="space-y-2">
                {receipt.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {expense.description ||
                            CATEGORY_LABELS[expense.category]}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {CATEGORY_LABELS[expense.category] ||
                              expense.category}
                          </Badge>
                          {expense.confidence && (
                            <span className="text-xs text-muted-foreground">
                              {Math.round(parseFloat(expense.confidence) * 100)}
                              % confidence
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-light">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: expense.currency,
                        }).format(parseFloat(expense.amount))}
                      </p>
                    </div>
                    {expense.merchantName &&
                      expense.merchantName !== merchantName && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Store className="h-3 w-3" />
                          <span>{expense.merchantName}</span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-1 text-xs text-foreground/50">
            <p>
              Uploaded: {new Date(receipt.uploadedAt).toLocaleString("en-IN")}
            </p>
            {receipt.processedAt && (
              <p>
                Processed:{" "}
                {new Date(receipt.processedAt).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
