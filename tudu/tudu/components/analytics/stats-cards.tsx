import { DollarSign, Receipt, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  count: number;
  average: number;
  currency?: string;
}

export function StatsCards({ total, count, average, currency = 'INR' }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="text-sm font-light">Total Spending</div>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-2xl font-light">{formatCurrency(total)}</div>
          <p className="text-xs text-muted-foreground">
            Across all categories
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="text-sm font-light">Transactions</div>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-2xl font-light">{count}</div>
          <p className="text-xs text-muted-foreground">
            Total receipts tracked
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="text-sm font-light">Average per Transaction</div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-2xl font-light">{formatCurrency(average)}</div>
          <p className="text-xs text-muted-foreground">
            Per expense
          </p>
        </div>
      </div>
    </div>
  );
}
