'use client';

import { useState } from 'react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface TimeData {
  date: string;
  total: number;
  count: number;
}

interface TimeChartProps {
  data: TimeData[];
}

const chartConfig: ChartConfig = {
  total: {
    label: 'Spending',
    color: 'var(--chart-1)',
  },
};

export function TimeChart({ data }: TimeChartProps) {
  const [billingView, setBillingView] = useState<'statement' | 'unbilled'>('statement');

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: item.total,
  }));

  // Calculate average
  const average = data.length > 0
    ? data.reduce((sum, item) => sum + item.total, 0) / data.length
    : 0;

  // Calculate percentage change (comparing last value to average)
  const currentTotal = data[data.length - 1]?.total || 0;
  const percentChange = average > 0
    ? (((currentTotal - average) / average) * 100)
    : 0;
  const isNegative = percentChange < 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
    }).format(value);
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">SPEND TRENDS</p>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-3xl font-light">
            {Math.abs(percentChange).toFixed(1)}%
          </h3>
          {isNegative ? (
            <TrendingDown className="h-6 w-6 text-green-500" />
          ) : (
            <TrendingUp className="h-6 w-6 text-red-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          spending has gone {isNegative ? 'down' : 'up'}, {isNegative ? "that's some impressive discipline on display" : 'keep track of your expenses'}
        </p>

        <div className="inline-flex items-center rounded-lg border bg-background p-1">
          <button
            onClick={() => setBillingView('statement')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              billingView === 'statement'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            STATEMENT
          </button>
          <button
            onClick={() => setBillingView('unbilled')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              billingView === 'unbilled'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            UNBILLED
          </button>
        </div>
      </div>
      <div>
        <ChartContainer config={chartConfig} className="w-full h-[300px]">
          <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) =>
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }).format(value as number)
                }
              />
              <ReferenceLine
                y={average}
                stroke="var(--chart-3)"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `AVG ${formatCurrency(average)}`,
                  position: 'insideTopRight',
                  fill: 'var(--chart-3)',
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="total"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
