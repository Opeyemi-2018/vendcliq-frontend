"use client";

import {
  Calculator,
  Milk,
  MoveRight,
  PillBottle,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { month: "Monday", desktop: 186, mobile: 80 },
  { month: "Tuesday", desktop: 305, mobile: 200 },
  { month: "Wednesday", desktop: 237, mobile: 120 },
  { month: "Thursday", desktop: 73, mobile: 190 },
  { month: "Friday", desktop: 209, mobile: 130 },
  { month: "Saturday", desktop: 214, mobile: 140 },
  { month: "Sunday", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAreaAxes() {
  return (
    <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
      <div>
        <CardTitle>Your Metrics</CardTitle>
        <CardDescription>Sales Trend</CardDescription>
      </div>
      <div className="pt-0  flex flex-col gap-3 lg:gap-0 lg:flex-row justify-between">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full lg:w-[60%]"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -20,
              right: 12,
              top: 50,
              bottom: 10,
            }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A6DC0" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0A6DC0" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
              fontSize={12}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#chartGradient)"
              stroke="#0A6DC0"
              strokeWidth={2}
              fillOpacity={1}
            />
            {/* <Area
              dataKey="desktop"
              type="natural"
              fill="url(#chartGradient)"
              stroke="#0A6DC0"
              strokeWidth={2}
              fillOpacity={1}
            /> */}
          </AreaChart>
        </ChartContainer>

        <div className="lg:border-[1px] bg-white border-[#E4E4E4] rounded-lg w-full lg:w-[35%] md:p-4 font-dm-sans">
          <h2 className="font-regular text-[#202224]">
            Top 3 Selling Products
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center mt-4 border border-[#E4E4E4] px-4  py-2  bg-white rounded-2xl">
              <div className="flex items-center gap-1">
                <Milk className="text-[#0A6DC0]" />
                <div className=" ">
                  <p className="font-medium text-[#000000] text-[13px]">
                    Fearless{" "}
                  </p>
                  <p className="text-[12px] font-regular text-[#5A6315] ">
                    10 packs sold
                  </p>
                  <p className="text-[#F5B102] font-regular text-[11px]">
                    10 items remaining
                  </p>
                </div>
              </div>

              <MoveRight />
            </div>
            <div className="flex justify-between items-center mt-4 border border-[#E4E4E4] px-4  py-2  bg-white rounded-2xl">
              <div className="flex items-center gap-1">
                <Milk className="text-[#0A6DC0]" />
                <div className=" ">
                  <p className="font-medium text-[#000000] text-[13px]">
                    Fearless{" "}
                  </p>
                  <p className="text-[12px] font-regular text-[#5A6315] ">
                    10 packs sold
                  </p>
                  <p className="text-[#F5B102] font-regular text-[11px]">
                    10 items remaining
                  </p>
                </div>
              </div>

              <MoveRight />
            </div>
            <div className="flex justify-between items-center mt-4 border border-[#E4E4E4] px-4  py-2  bg-white rounded-2xl">
              <div className="flex items-center gap-1">
                <Milk className="text-[#0A6DC0]" />
                <div className=" ">
                  <p className="font-medium text-[#000000] text-[13px]">
                    Fearless{" "}
                  </p>
                  <p className="text-[12px] font-regular text-[#5A6315] ">
                    10 packs sold
                  </p>
                  <p className="text-[#F5B102] font-regular text-[11px]">
                    10 items remaining
                  </p>
                </div>
              </div>

              <MoveRight />
            </div>
          </div>

          <h1 className="py-3">product running out</h1>
          <div className="flex justify-between items-center  border border-[#E4E4E4] px-4  py-2  bg-white rounded-2xl">
            <div className="flex items-center gap-1">
              <Milk className="text-[#0A6DC0]" />
              <div className=" ">
                <p className="font-medium text-[#000000] text-[13px]">
                  Fearless{" "}
                </p>
                <p className="text-[#F5B102] font-regular text-[11px]">
                  10 items remaining
                </p>
              </div>
            </div>

            <MoveRight />
          </div>
        </div>
      </div>
    </div>
  );
}
