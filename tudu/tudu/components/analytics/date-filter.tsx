"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "all";

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("range");
    } else {
      params.set("range", value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 hidden">
      <span className="text-sm font-medium">Time Range:</span>
      <Select value={currentRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="90d">Last 90 Days</SelectItem>
          <SelectItem value="1y">Last Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
