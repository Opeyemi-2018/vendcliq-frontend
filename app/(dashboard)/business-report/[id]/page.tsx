/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MoveLeft, TrendingUp, Package, ShoppingCart,  RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/utils/api/apiHelper";
import { format, parseISO } from "date-fns";
import { ThreeDots } from "react-loader-spinner";
import Image from "next/image";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SkuReportData {
  product: {
    name: string;
    image: string;
    manufacturer: string;
    sku: string;
  };
  summary: {
    profitability: number;
    margin_percent: number;
    sales_volume: number;
    sales_count: number;
    avg_qty_per_txn: number;
    total_revenue: number;
    stock_delta: {
      opening_qty: number;
      closing_qty: number;
      change: number;
    };
  };
  sales_over_time: {
    date: string;
    qty: number;
    revenue: number;
  }[];
  recent_transactions: {
    invoice_id: string;
    invoice_code: string;
    date: string;
    customer_name: string;
    qty: number;
    amount: number;
  }[];
  date_range: {
    start_date: string;
    end_date: string;
  };
}

// ─── Chart Config ─────────────────────────────────────────────────────────────

const chartConfig = {
  qty: {
    label: "Qty Sold",
    color: "#0A6DC0",
  },
} satisfies ChartConfig;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  iconBg?: string;
}

const StatCard = ({ icon, label, value, sub, iconBg = "bg-blue-50" }: StatCardProps) => (
  <Card className="p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#9E9A9A] font-dm-sans">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="font-clash font-semibold text-[22px] text-[#2F2F2F]">{value}</p>
      {sub && <p className="text-xs text-[#9E9A9A] mt-1 font-dm-sans">{sub}</p>}
    </div>
  </Card>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const SkuReportDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const stockId = params?.id as string;
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const [data, setData] = useState<SkuReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stockId) return;

    const fetchSkuReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = { stockId };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const query = new URLSearchParams(params).toString();
        const res = await fetcher<{ statusCode: number; data: SkuReportData }>(
          `inventory/dashboard/sku-report?${query}`
        );

        if (res.statusCode === 200 && res.data) {
          setData(res.data);
        } else {
          setError("Failed to load SKU report");
        }
      } catch {
        setError("Error fetching SKU report");
      } finally {
        setLoading(false);
      }
    };

    fetchSkuReport();
  }, [stockId, startDate, endDate]);

  const formatCurrency = (v: number) => `₦${Math.round(v).toLocaleString()}`;

  const chartData = (data?.sales_over_time ?? []).map((d) => ({
    date: format(parseISO(d.date), "MMM dd"),
    qty: d.qty,
    revenue: d.revenue,
  }));

  const stockDelta = data?.summary.stock_delta;
  const stockDeltaLabel = stockDelta
    ? `Opening ${stockDelta.opening_qty} → Closing ${stockDelta.closing_qty}`
    : "";

  const displayDateRange = () => {
    if (!startDate || !endDate) return "";
    const s = parseISO(startDate);
    const e = parseISO(endDate);
    if (startDate === endDate) return format(s, "MMM dd, yyyy");
    return `${format(s, "MMM dd, yyyy")} – ${format(e, "MMM dd, yyyy")}`;
  };

  // ─── Error State ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-[#9E9A9A] font-dm-sans">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <MoveLeft className="h-4 w-4" /> Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-6 flex-col md:flex-row gap-3">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
            Business Reports
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            Stock, sales, and profitability across stores
          </p>
        </div>
      </div>

      {/* ─── Nav Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[#2F2F2F] font-dm-sans"
          >
            <MoveLeft className="h-4 w-4" />
            Back to Reports
          </Button>

          <Badge
            variant="outline"
            className="text-[#0A6DC0] border-[#0A6DC0] bg-blue-50 font-dm-sans text-xs px-3 py-1"
          >
            • SKU Report
          </Badge>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2 text-sm font-dm-sans"
          disabled={loading}
        >
          Export Report
        </Button>
      </div>

      {/* ─── Product Identity Card ───────────────────────────────────────────── */}
      <Card className="p-6 mb-6 flex items-center gap-5">
        {loading ? (
          <>
            <SkeletonBlock className="w-14 h-14 rounded-xl flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <SkeletonBlock className="h-5 w-48" />
              <SkeletonBlock className="h-4 w-32" />
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
              {data?.product.image ? (
                <Image
                  src={
                    data.product.image.startsWith("//")
                      ? `https:${data.product.image}`
                      : data.product.image
                  }
                  alt={data.product.name ?? "Product"}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="text-[#0A6DC0] h-7 w-7" />
              )}
            </div>
            <div>
              <h2 className="font-clash font-semibold text-[18px] md:text-[22px] text-[#2F2F2F]">
                {data?.product.name}
              </h2>
              <p className="text-[#9E9A9A] font-dm-sans text-sm mt-0.5">
                {data?.product.sku && `${data.product.sku.toUpperCase()} · `}
                {data?.product.manufacturer}
              </p>
              {displayDateRange() && (
                <p className="text-[#9E9A9A] font-dm-sans text-xs mt-1">
                  {displayDateRange()}
                </p>
              )}
            </div>
          </>
        )}
      </Card>

      {/* ─── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array(4)
            .fill(null)
            .map((_, i) => (
              <Card key={i} className="p-5 flex flex-col gap-3">
                <div className="flex justify-between">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                </div>
                <SkeletonBlock className="h-7 w-28 mt-1" />
                <SkeletonBlock className="h-3 w-20" />
              </Card>
            ))
        ) : (
          <>
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-[#0A6DC0]" />}
              label="Profitability"
              value={formatCurrency(data?.summary.profitability ?? 0)}
              sub={`Margin: ${data?.summary.margin_percent?.toFixed(0)}%`}
              iconBg="bg-blue-50"
            />
            <StatCard
              icon={<Package className="h-4 w-4 text-purple-500" />}
              label="Sales Volume"
              value={`${data?.summary.sales_volume ?? 0} units`}
              sub="Across the period"
              iconBg="bg-purple-50"
            />
            <StatCard
              icon={<ShoppingCart className="h-4 w-4 text-amber-500" />}
              label="Sales Count"
              value={`${data?.summary.sales_count ?? 0} txns`}
              sub={`Avg ${data?.summary.avg_qty_per_txn ?? 0} units/txn`}
              iconBg="bg-amber-50"
            />
            <StatCard
              icon={<RefreshCw className="h-4 w-4 text-rose-500" />}
              label="Stock Δ"
              value={stockDelta?.change ?? 0}
              sub={stockDeltaLabel}
              iconBg="bg-rose-50"
            />
          </>
        )}
      </div>

      {/* ─── Sales Volume Over Time Chart ────────────────────────────────────── */}
      <Card className="p-6 mb-6">
        <h3 className="font-dm-sans font-bold text-[#2F2F2F] mb-5 flex items-center gap-2">
          Sales Volume Over Time
          {loading && <ThreeDots height="16" width="24" color="#0A6DC0" />}
        </h3>

        {loading ? (
          <div className="h-[260px] flex items-end gap-2 px-2">
            {Array(12)
              .fill(null)
              .map((_, i) => (
                <SkeletonBlock
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ height: `${30 + Math.random() * 60}%` } as any}
                />
              ))}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-[#9E9A9A] font-dm-sans text-sm">
            No sales data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A6DC0" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0A6DC0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9E9A9A" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9E9A9A" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="qty"
                stroke="#0A6DC0"
                strokeWidth={2.5}
                fill="url(#colorQty)"
                dot={{ fill: "#0A6DC0", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#0A6DC0" }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </Card>

      {/* ─── Recent Transactions ─────────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-dm-sans font-bold text-[#2F2F2F] flex items-center gap-2">
            Recent Transactions
            {loading && <ThreeDots height="16" width="24" color="#0A6DC0" />}
          </h3>
          {!loading && (data?.recent_transactions?.length ?? 0) > 0 && (
            <button className="text-[#0A6DC0] text-sm font-dm-sans font-medium flex items-center gap-1 hover:underline">
              View all →
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-[#E6E6E6]">
                {["DATE", "INVOICE", "CUSTOMER", "QTY", "AMOUNT"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 font-medium font-dm-sans text-[11px] text-[#9E9A9A] tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {loading ? (
                Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(5)
                        .fill(null)
                        .map((__, j) => (
                          <td key={j} className="py-4">
                            <SkeletonBlock className="h-4 w-20" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : (data?.recent_transactions?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <p className="text-[#9E9A9A] font-dm-sans text-sm">
                      No transactions found for this period
                    </p>
                  </td>
                </tr>
              ) : (
                data?.recent_transactions.map((txn) => (
                  <tr
                    key={txn.invoice_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 font-dm-sans text-[13px] text-[#2F2F2F]">
                      {format(parseISO(txn.date), "MMM dd")}
                    </td>
                    <td className="py-4">
                      <span className="text-[#0A6DC0] font-dm-sans text-[13px] font-medium cursor-pointer hover:underline">
                        {txn.invoice_code}
                      </span>
                    </td>
                    <td className="py-4 font-dm-sans text-[13px] text-[#2F2F2F]">
                      {txn.customer_name}
                    </td>
                    <td className="py-4 font-dm-sans text-[13px] text-[#2F2F2F]">
                      {txn.qty}
                    </td>
                    <td className="py-4 font-dm-sans text-[13px] font-semibold text-[#2F2F2F]">
                      {formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SkuReportDetailPage;