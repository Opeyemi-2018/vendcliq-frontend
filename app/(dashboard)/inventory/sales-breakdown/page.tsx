/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ArrowLeft, MoveLeft } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStores } from "@/hooks/useStores";
import { getStoreStockSales } from "@/lib/utils/api/apiHelper";
import { useRouter } from "next/navigation";

type StoreSales = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
};

type ProductSale = {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  sub_total: number;
  mode: string;
};

const SalesBreakdown = () => {
  const { data: stores = [] } = useStores();
  const router = useRouter();
  // Date filter
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Data
  const [storeSales, setStoreSales] = useState<StoreSales[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductSale[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Mobile view state: show stores list or products detail
  const [showProductsView, setShowProductsView] = useState(false);

  // Default: last 30 days → today
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

    setStartDate(thirtyDaysAgo);
    setEndDate(today);
    setTempStartDate(thirtyDaysAgo);
    setTempEndDate(today);
  }, []);

  // Fetch all stores' sales
  useEffect(() => {
    if (!startDate || !endDate || stores.length === 0) return;

    const fetchStoreSales = async () => {
      setLoadingStores(true);
      try {
        const promises = stores.map(async (store) => {
          const res = await getStoreStockSales(store.id, startDate, endDate);
          if (res?.statusCode === 200 && Array.isArray(res.data)) {
            const items = res.data;
            const storeTotal = items.reduce(
              (sum: number, item: any) => sum + (item.sub_total || 0),
              0,
            );
            return {
              id: store.id,
              name: store.name,
              amount: storeTotal,
              percentage: 0, // calculated later
            };
          }
          return null;
        });

        const results = (await Promise.all(promises)).filter(
          (r): r is StoreSales => r !== null,
        );

        const grandTotal = results.reduce((sum, s) => sum + s.amount, 0);

        const enriched = results.map((s) => ({
          ...s,
          percentage:
            grandTotal > 0
              ? Math.round((s.amount / grandTotal) * 1000) / 10
              : 0,
        }));

        setStoreSales(enriched);
        setTotalSales(grandTotal);

        // Auto-select FIRST store by default
        if (!selectedStoreId && enriched.length > 0) {
          setSelectedStoreId(enriched[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load store sales");
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStoreSales();
  }, [startDate, endDate, stores]);

  // Fetch products when store is selected
  useEffect(() => {
    if (!selectedStoreId || !startDate || !endDate) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await getStoreStockSales(
          selectedStoreId,
          startDate,
          endDate,
        );
        if (res?.statusCode === 200 && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedStoreId, startDate, endDate]);

  const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

  const period =
    startDate && endDate
      ? `${format(new Date(startDate), "MMM dd")} - ${format(new Date(endDate), "MMM dd")}`
      : "Select date range";

  const displayDateRange = () => {
    if (!startDate || !endDate) return "Select date range";
    return `${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}`;
  };

  const handleApplyDateFilter = () => {
    if (tempStartDate && tempEndDate && tempStartDate <= tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      setDateModalOpen(false);
    } else {
      toast.error("Please select a valid date range");
    }
  };

  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId);
    // On mobile: switch to products view
    setShowProductsView(true);
  };

  const handleBackToStores = () => {
    setShowProductsView(false);
  };

  const selectedStore = storeSales.find((s) => s.id === selectedStoreId);

  return (
    <div className="text-[#2F2F2F] font-dm-sans">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors mb-4 print-hidden"
      >
        <MoveLeft className="w-5 h-5" />
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            Sales Breakdown by Store
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A]">
            See how your stores made the total sales
          </p>
        </div>

        <Button
          variant="outline"
          className="justify-start text-left font-normal h-10 px-3 text-sm bg-white border-[#E4E4E4]"
          onClick={() => setDateModalOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDateRange()}
        </Button>
      </div>

      {/* Date Modal */}
      <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter by Date Range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="start">From</Label>
              <Input
                id="start"
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end">To</Label>
              <Input
                id="end"
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleApplyDateFilter}
              className="bg-[#0A6DC0] hover:bg-[#085a9e] w-full"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
        {/* Stores List - hidden on mobile when viewing products */}
        <div
          className={cn(
            "md:p-6 lg:border border-[#E4E4E4] md:rounded-lg bg-white w-full lg:w-[40%] min-h-[400px]",
            showProductsView ? "hidden lg:block" : "block",
          )}
        >
          <div className="mb-3 md:mb-5">
            <h2 className="font-semibold mb-2">
              Total Sales: {formatNaira(totalSales)} • {period}
            </h2>
            <Separator
              orientation="horizontal"
              className="h-[1px]"
              style={{ background: "#E0E0E0" }}
            />
          </div>

          {loadingStores ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A6DC0]" />
            </div>
          ) : storeSales.length === 0 ? (
            <p className="text-center text-[#9E9A9A] py-10">
              No sales data for this period
            </p>
          ) : (
            <div className="space-y-5">
              {storeSales.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreSelect(store.id)}
                  className={`p-4 rounded-lg transition-colors cursor-pointer ${
                    selectedStoreId === store.id
                      ? "bg-[#0A6DC012] border border-[#0A6DC0]"
                      : "bg-white border border-[#D8D8D866] hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/store.svg"
                        alt="store"
                        width={24}
                        height={24}
                      />
                      <div>
                        <p className="font-bold text-[13px] md:text-[16px]">
                          {store.name}
                        </p>
                        <p className="text-[13px] text-[#9E9A9A]">
                          {store.percentage}% of total sales
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-[13px] md:text-[16px]">
                      {formatNaira(store.amount)}
                    </p>
                  </div>

                  <div className="h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0A6DC0] rounded-full"
                      style={{ width: `${store.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products View */}
        <div
          className={cn(
            "w-full lg:w-[60%] md:p-6 lg:border border-[#E4E4E4] md:rounded-lg bg-white min-h-[400px]",
            showProductsView ? "block" : "hidden lg:block",
          )}
        >
          {selectedStore ? (
            <>
              {/* Back button - only visible on mobile */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-[#0A6DC0] hover:bg-transparent p-0"
                  onClick={handleBackToStores}
                >
                  <ArrowLeft size={20} />
                  Back to Stores
                </Button>
              </div>

              <div className="mb-3 md:mb-5">
                <h2 className="text-[13px] md:text-[16px] font-semibold font-clash mb-2">
                  Products Sold In Store
                </h2>
                <Separator
                  orientation="horizontal"
                  className="h-[1px]"
                  style={{ background: "#E0E0E0" }}
                />
              </div>

              <h2 className="text-[18px] md:text-[25px] font-regular font-clash">
                {selectedStore.name} - {formatNaira(selectedStore.amount)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                See what you sold to make profit in this store
              </p>

              {loadingProducts ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A6DC0]" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-center text-[#9E9A9A] py-10 mt-6">
                  No products sold in this period
                </p>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 mt-3">
                  {products.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between py-2 border border-[#D8D8D866] p-5 rounded-lg transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                          {product.product_image ? (
                            <Image
                              src={
                                product.product_image.startsWith("//")
                                  ? `https:${product.product_image}`
                                  : product.product_image
                              }
                              alt={product.product_name}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              {product.product_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[13px] md:text-[16px] truncate">
                            {product.product_name}
                          </p>
                          <p className="text-[13px] md:text-[16px]">
                            {product.quantity} {product.mode.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      <p className="font-medium">
                        {formatNaira(product.sub_total)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-[#9E9A9A]">
              Select a store to view products sold
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesBreakdown;
