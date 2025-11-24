"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

interface MerchantData {
  merchantName: string | null;
  total: number;
  count: number;
}

interface MerchantChartProps {
  data: MerchantData[];
}

const chartConfig: ChartConfig = {
  total: {
    label: "Amount",
    color: "hsl(var(--chart-2))",
  },
};

export function MerchantChart({ data }: MerchantChartProps) {
  const chartData = data
    .filter((item) => item.merchantName)
    .map((item) => ({
      name:
        item.merchantName!.length > 15
          ? item.merchantName!.substring(0, 15) + "..."
          : item.merchantName!,
      total: item.total,
    }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="mb-6">
          <div className="font-light leading-none">Top Merchants</div>
          <div className="text-sm text-muted-foreground mt-2">
            Your most frequent merchants
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No merchant data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="mb-6">
        <div className="font-light leading-none">Top Merchants</div>
        <div className="text-sm text-muted-foreground mt-2">
          Your most frequent merchants
        </div>
      </div>
      <div>
        <ChartContainer config={chartConfig} className="w-full h-[300px]">
          <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    notation: "compact",
                  }).format(value)
                }
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(value as number)
                }
              />
              <Bar
                dataKey="total"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
