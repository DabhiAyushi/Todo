'use client';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart } from 'recharts';

interface CategoryData {
  category: string;
  total: number;
  count: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const CATEGORY_CHART_COLORS: Record<string, string> = {
  food: 'var(--chart-1)',
  lifestyle: 'var(--chart-2)',
  subscriptions: 'var(--chart-3)',
  transportation: 'var(--chart-4)',
  shopping: 'var(--chart-5)',
  entertainment: 'var(--chart-6)',
  utilities: 'var(--chart-7)',
  healthcare: 'var(--chart-8)',
  other: 'var(--chart-9)',
};

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food',
  lifestyle: 'Lifestyle',
  subscriptions: 'Subscriptions',
  transportation: 'Transportation',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  other: 'Other',
};

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.total,
    category: item.category,
    count: item.count,
    fill: `var(--color-${item.category})`,
    color: CATEGORY_CHART_COLORS[item.category],
  }));

  const chartConfig: ChartConfig = data.reduce((acc, item) => {
    acc[item.category] = {
      label: CATEGORY_LABELS[item.category] || item.category,
      color: CATEGORY_CHART_COLORS[item.category],
    };
    return acc;
  }, {} as ChartConfig);

  const total = data.reduce((sum, item) => sum + item.total, 0);
  const topCategory = data[0];
  const topPercentage = topCategory ? ((topCategory.total / total) * 100).toFixed(1) : '0';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">TOP SPENDS CATEGORY</p>
        <h3 className="text-2xl font-light mb-1">
          {topPercentage}% on {CATEGORY_LABELS[topCategory?.category] || 'expenses'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Every spend on {CATEGORY_LABELS[topCategory?.category]?.toLowerCase() || 'expenses'} was a little joy you deserved
        </p>
      </div>
      <div>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] mb-4">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
            />
          </PieChart>
        </ChartContainer>

        <div className="text-center mb-6">
          <p className="text-3xl font-light">{formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Spending</p>
        </div>

        <div className="space-y-3">
          {chartData.map((item) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.count} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-light">{formatCurrency(item.value)}</p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
