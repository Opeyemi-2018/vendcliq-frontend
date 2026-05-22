/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  UserPen,
  CalendarIcon,
  MoveLeft,
  MoveRight,
  Check,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BusinessReportResponse,
  StockComparisonItem,
} from "@/types/businessReport";
import { RotateCcw } from "lucide-react";
import {
  handleGetBusinessReportComparison,
  getManufacturers,
  getUserStocks,
} from "@/lib/utils/api/apiHelper";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { format, parseISO, subDays } from "date-fns";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { UserStock } from "@/types/stock";

interface TableReportItem {
  id: string;
  storeName: string;
  itemName: string;
  openingQty: number;
  stockUuid: string;
  value_change: number;
  closingQty: number;
  openingEmptyQty: number;
  closingEmptyQty: number;
  totalQtyDiff: number;
  openingStockValue: string;
}

interface Manufacturer {
  id: string;
  name: string;
}

const ReportSkeleton = () => (
  <tr className="animate-pulse">
    <td className="py-4 pl-4">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-48"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
  </tr>
);

const BusinessReports = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [reports, setReports] = useState<TableReportItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<TableReportItem[]>([]);
  const [summary, setSummary] = useState<
    BusinessReportResponse["data"]["summary"] | null
  >(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

  const [loading, setLoading] = useState(false);
  const [manufacturersLoading, setManufacturersLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // SKU Combobox
  const [mobileSkuOpen, setMobileSkuOpen] = useState(false);
  const [desktopSkuOpen, setDesktopSkuOpen] = useState(false);
  const [skuSearch, setSkuSearch] = useState("");
  const router = useRouter();

  // Stock items
  const [stockItems, setStockItems] = useState<UserStock[]>([]);
  const [stockPage, setStockPage] = useState(1);
  const [stockHasMore, setStockHasMore] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const stockSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stockInitializedRef = useRef(false);

  // Manufacturer states
  const [manufacturerOpen, setManufacturerOpen] = useState(false);
  const [manufacturerSearch, setManufacturerSearch] = useState("");

  // Store states
  const [storeOpen, setStoreOpen] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");

  const uniqueStores = useMemo(() => {
    const stores = new Set(reports.map((r) => r.storeName));
    return ["all", ...Array.from(stores).sort()];
  }, [reports]);

  // Filter stores based on search (client-side)
  const filteredStores = useMemo(() => {
    if (!storeSearch) return uniqueStores;
    return uniqueStores.filter((store) =>
      store === "all"
        ? false
        : store.toLowerCase().includes(storeSearch.toLowerCase()),
    );
  }, [uniqueStores, storeSearch]);

  // Filter manufacturers based on search (client-side)
  const filteredManufacturers = useMemo(() => {
    if (!manufacturerSearch.trim()) return manufacturers;
    return manufacturers.filter((manufacturer) =>
      manufacturer.name
        .toLowerCase()
        .includes(manufacturerSearch.toLowerCase()),
    );
  }, [manufacturers, manufacturerSearch]);

  const fetchStocks = async (page: number, search: string, replace = false) => {
    if (stockLoading) return;
    setStockLoading(true);
    try {
      const res = await getUserStocks(page, 10, search);
      const items = res?.data ?? [];
      setStockItems((prev) => (replace ? items : [...prev, ...items]));
      setStockHasMore(items.length === 10);
      setStockPage(page);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setStockLoading(false);
    }
  };

  // Load stocks when popover opens
  useEffect(() => {
    if ((desktopSkuOpen || mobileSkuOpen) && !stockInitializedRef.current) {
      stockInitializedRef.current = true;
      fetchStocks(1, "");
    }
  }, [desktopSkuOpen, mobileSkuOpen]);

  // Fetch manufacturers on component mount
  const fetchManufacturers = async () => {
    if (manufacturersLoading) return;
    setManufacturersLoading(true);
    try {
      const res = await getManufacturers(1, 1000, "");
      console.log("Manufacturers count:", res?.data?.length); // 👈 THIS ONE LINE

      const items = res?.data ?? [];
      setManufacturers(items);
      console.log("Manufacturers loaded:", items.length);
    } catch (err) {
      console.error("Failed to load manufacturers:", err);
      toast.error("Failed to load manufacturers");
    } finally {
      setManufacturersLoading(false);
    }
  };

  // Load manufacturers when component mounts
  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchReport = async (sDate?: string, eDate?: string) => {
    setLoading(true);
    try {
      const res = await handleGetBusinessReportComparison(
        sDate,
        eDate,
        selectedManufacturer || undefined,
        selectedSku || undefined,
      );

      if (res.statusCode === 200 && res.data) {
        const { summary, stock_comparison } = res.data;

        setSummary(summary);

        const mapped: TableReportItem[] = stock_comparison.map(
          (item: StockComparisonItem) => ({
            id: String(item.stock_id),
            stockUuid: item.stock_uuid,
            storeName: item.store_name,
            itemName: item.product_name,
            openingQty: item.opening_qty,
            closingQty: item.closing_qty,
            value_change: item.value_change,
            openingEmptyQty: 0,
            closingEmptyQty: 0,
            totalQtyDiff: item.qty_change,
            openingStockValue: `₦${Math.round(item.opening_value).toLocaleString()}`,
          }),
        );

        setReports(mapped);
        setFilteredReports(mapped);
        setCurrentPage(1);
        setHasFetched(true);

        if (mapped.length === 0) {
          toast.info("No stock data found for this date range");
        }
      } else {
        toast.error(res.error || "Failed to load business report");
      }
    } catch (err: any) {
      toast.error("Error fetching business report");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch - Last 3 days
  useEffect(() => {
    if (hasFetched) return;

    const today = new Date();
    const threeDaysAgo = subDays(today, 3);
    const defaultDate = format(threeDaysAgo, "yyyy-MM-dd");

    setStartDate(defaultDate);
    setEndDate(defaultDate);
    setTempStartDate(defaultDate);
    setTempEndDate(defaultDate);

    fetchReport(defaultDate, defaultDate);
  }, [hasFetched]);

  // Store filter
  useEffect(() => {
    const filtered =
      selectedStore === "all"
        ? reports
        : reports.filter((r) => r.storeName === selectedStore);

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [reports, selectedStore]);

  // Refetch when manufacturer or SKU changes
  useEffect(() => {
    if (hasFetched) {
      fetchReport(startDate, endDate);
    }
  }, [selectedManufacturer, selectedSku]);

  const handleApplyDateFilter = () => {
    if (!tempStartDate || !tempEndDate) {
      toast.error("Please select both dates");
      return;
    }
    if (tempStartDate > tempEndDate) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    fetchReport(tempStartDate, tempEndDate);
    setDateModalOpen(false);
  };

  // SKU Search Handler
  const handleSkuSearch = (query: string) => {
    setSkuSearch(query);
    setStockSearch(query);

    if (stockSearchRef.current) clearTimeout(stockSearchRef.current);

    stockSearchRef.current = setTimeout(() => {
      fetchStocks(1, query, true);
    }, 300);
  };

  // Infinite scroll handler for SKU
  const handleStockScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (nearBottom && stockHasMore && !stockLoading) {
      fetchStocks(stockPage + 1, stockSearch);
    }
  };

  const handleSkuSelect = (name: string) => {
    setSelectedSku(name);
    setMobileSkuOpen(false);
    setDesktopSkuOpen(false);
    setSkuSearch("");
  };

  const handleManufacturerSelect = (name: string) => {
    setSelectedManufacturer(name);
    setManufacturerOpen(false);
    setManufacturerSearch("");
  };

  const clearFilters = () => {
    setSelectedStore("all");
    setSelectedManufacturer("");
    setSelectedSku("");
    setSkuSearch("");
    setStoreSearch("");
    setManufacturerSearch("");
  };

  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatCurrency = (value: number) =>
    `₦${Math.round(value).toLocaleString()}`;

  const displayDateRange = () => {
    if (!startDate || !endDate) return "Select date range";
    const s = parseISO(startDate);
    const e = parseISO(endDate);
    if (startDate === endDate) return format(s, "MMM dd, yyyy");
    return `${format(s, "MMM dd, yyyy")} – ${format(e, "MMM dd, yyyy")}`;
  };

  const SkuCommandList = () => (
    <CommandList onScroll={handleStockScroll}>
      <CommandEmpty>
        {stockLoading ? (
          <div className="flex justify-center py-6">
            <ClipLoader size={24} color="#0A6DC0" />
          </div>
        ) : (
          "No product found."
        )}
      </CommandEmpty>
      <CommandGroup>
        {stockItems.map((stock, index) => {
          const name = stock.product?.name ?? "";
          const image = stock.product?.image ?? null;
          const storeName = stock.store?.name ?? "";

          return (
            <CommandItem
              key={stock.id ?? index}
              onSelect={() => handleSkuSelect(name)}
              className="cursor-pointer py-3 px-4"
            >
              <div className="flex items-center gap-3 w-full">
                {image && (
                  <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden border flex-shrink-0">
                    <Image
                      src={image}
                      alt={name}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">
                    {name || "Unnamed Product"}
                  </span>
                  {storeName && (
                    <span className="text-xs text-gray-500 truncate">
                      {storeName}
                    </span>
                  )}
                </div>
                {selectedSku === name && (
                  <Check className="ml-auto h-4 w-4 text-[#0A6DC0] flex-shrink-0" />
                )}
              </div>
            </CommandItem>
          );
        })}
        {stockLoading && stockItems.length > 0 && (
          <div className="flex justify-center py-3">
            <ClipLoader size={20} color="#0A6DC0" />
          </div>
        )}
      </CommandGroup>
    </CommandList>
  );

  return (
    <div>
      <div className="flex justify-between gap-3 md:gap-0 flex-col mb-6">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
            Business Reports
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            View your business key performance reports and stock summaries
          </p>
        </div>

        {/* ==================== MOBILE FILTER ==================== */}
        <div className="lg:hidden pt-4">
          <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-11">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Filter Reports
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[95vw] mx-auto rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Filter Business Report</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Date Range
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">From</Label>
                      <Input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">To</Label>
                      <Input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Note: Manufacturer, SKU, and Store filters are in the main toolbar above */}
                <div className="text-center text-sm text-gray-500 py-2">
                  Use the filters above to search by Manufacturer, Product, or
                  Store
                </div>
              </div>

              <DialogFooter className="flex flex-col gap-3 sm:flex-row pt-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => {
                    handleApplyDateFilter();
                    setFilterModalOpen(false);
                  }}
                  className="bg-[#0A6DC0] hover:bg-[#085a9e] w-full sm:w-auto"
                >
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* ==================== DESKTOP FILTERS ==================== */}
        <div className="hidden lg:flex flex-wrap gap-3 pt-6">
          {/* Date Filter */}
          <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal h-10 px-3 w-[260px]",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {displayDateRange()}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] rounded-lg">
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
                    className="bg-[#FAFAFA]"
                  />
                </div>
                <div>
                  <Label htmlFor="end">To</Label>
                  <Input
                    id="end"
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="bg-[#FAFAFA]"
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

          {/* Manufacturer - Desktop */}
          <Popover
            open={manufacturerOpen}
            onOpenChange={setManufacturerOpen}
            modal
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] h-10 justify-between overflow-hidden"
              >
                <span className="truncate text-left flex-1">
                  {selectedManufacturer || "All Manufacturers"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search manufacturers..."
                  value={manufacturerSearch}
                  onValueChange={setManufacturerSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {manufacturersLoading ? (
                      <div className="flex justify-center py-6">
                        <ClipLoader size={24} color="#0A6DC0" />
                      </div>
                    ) : (
                      "No manufacturer found."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => handleManufacturerSelect("")}
                      className="cursor-pointer py-3 px-4"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="font-medium">All Manufacturers</span>
                        {selectedManufacturer === "" && (
                          <Check className="ml-auto h-4 w-4 text-[#0A6DC0]" />
                        )}
                      </div>
                    </CommandItem>
                    {filteredManufacturers.map((manufacturer) => (
                      <CommandItem
                        key={manufacturer.id}
                        onSelect={() =>
                          handleManufacturerSelect(manufacturer.name)
                        }
                        className="cursor-pointer py-3 px-4"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="font-medium">
                            {manufacturer.name}
                          </span>
                          {selectedManufacturer === manufacturer.name && (
                            <Check className="ml-auto h-4 w-4 text-[#0A6DC0]" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* SKU Combobox - Desktop */}
          <Popover open={desktopSkuOpen} onOpenChange={setDesktopSkuOpen} modal>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[260px] h-10 justify-between overflow-hidden"
              >
                <span className="truncate text-left flex-1">
                  {selectedSku ? selectedSku : "SKU"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search by name, store..."
                  value={skuSearch}
                  onValueChange={handleSkuSearch}
                />
                <SkuCommandList />
              </Command>
            </PopoverContent>
          </Popover>

          {/* Store - Desktop */}
          <Popover open={storeOpen} onOpenChange={setStoreOpen} modal>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[220px] h-10 justify-between overflow-hidden"
                disabled={loading || reports.length === 0}
              >
                <span className="truncate text-left flex-1">
                  {selectedStore === "all" ? "All Stores" : selectedStore}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search stores..."
                  value={storeSearch}
                  onValueChange={setStoreSearch}
                />
                <CommandList>
                  <CommandEmpty>No store found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedStore("all");
                        setStoreOpen(false);
                        setStoreSearch("");
                      }}
                      className="cursor-pointer py-3 px-4"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="font-medium">All Stores</span>
                        {selectedStore === "all" && (
                          <Check className="ml-auto h-4 w-4 text-[#0A6DC0]" />
                        )}
                      </div>
                    </CommandItem>
                    {filteredStores.map(
                      (store) =>
                        store !== "all" && (
                          <CommandItem
                            key={store}
                            onSelect={() => {
                              setSelectedStore(store);
                              setStoreOpen(false);
                              setStoreSearch("");
                            }}
                            className="cursor-pointer py-3 px-4"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <span className="font-medium">{store}</span>
                              {selectedStore === store && (
                                <Check className="ml-auto h-4 w-4 text-[#0A6DC0]" />
                              )}
                            </div>
                          </CommandItem>
                        ),
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            onClick={clearFilters}
            className="h-10 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center gap-2"
          >
            <RotateCcw size={10} />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6 flex flex-col justify-center">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Opening Stock Value
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {loading ? (
              <ThreeDots height="30" width="30" color="#FFFFFF" />
            ) : summary ? (
              formatCurrency(summary.opening_stock_value)
            ) : (
              "—"
            )}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6 flex flex-col justify-center">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Closing Stock Value
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {loading ? (
              <ThreeDots height="30" width="30" color="#FFFFFF" />
            ) : summary ? (
              formatCurrency(summary.closing_stock_value)
            ) : (
              "—"
            )}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6 flex flex-col justify-center">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Total Invoice Value{" "}
            {summary && `(${summary.invoice_count} invoices)`}
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {loading ? (
              <ThreeDots height="30" width="30" color="#FFFFFF" />
            ) : summary ? (
              formatCurrency(summary.total_invoice_value)
            ) : (
              "—"
            )}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6 flex flex-col justify-center">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Profit Generated
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {loading ? (
              <ThreeDots height="30" width="30" color="#FFFFFF" />
            ) : summary ? (
              formatCurrency(summary.profit_generated)
            ) : (
              "—"
            )}
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="md:p-6 lg:border bg-white border-[#E4E4E4] rounded-lg">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold flex gap-2 items-center">
          Stock Table Report{" "}
          {loading ? (
            <ThreeDots height="20" width="20" color="#0A6DC0" />
          ) : (
            `(${filteredReports.length})`
          )}
        </h1>

        <Card className="mt-3 py-5 relative overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-max min-w-full">
              <thead className="border-b border-[#E6E6E6] whitespace-nowrap">
                <tr>
                  <th className="text-left pl-4 pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Store Name
                  </th>
                  <th className="text-left pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Item Name
                  </th>
                  <th className="text-left pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Quantity
                  </th>
                  <th className="text-left pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Closing Quantity
                  </th>
                  <th className="text-left pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Total Quantity Difference
                  </th>
                  <th className="text-left pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Stock Value
                  </th>
                  <th className="text-left pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Value Change
                  </th>
                  <th className="text-left pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Empty Quantity
                  </th>
                  <th className="text-left pr-8 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Closing Empty Quantity
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y whitespace-nowrap">
                {loading ? (
                  Array(5)
                    .fill(null)
                    .map((_, i) => <ReportSkeleton key={i} />)
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <UserPen size={40} className="text-gray-400 mx-auto" />
                        <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F]">
                          No reports found
                        </p>
                        <p className="text-[#9E9A9A]">
                          No data for selected filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report) => (
                    <tr
                      key={report.id}
                      className={cn(
                        "hover:bg-gray-50 transition-colors text-[13px] cursor-pointer",
                      )}
                      onClick={() => {
                        router.push(
                          `/business-report/${report.stockUuid}?startDate=${startDate}&endDate=${endDate}`,
                        );
                      }}
                    >
                      <td className="py-4 pl-4 pr-8 font-medium">
                        {report.storeName}
                      </td>
                      <td className="py-4 pr-8">
                        {report.itemName.length > 20
                          ? `${report.itemName.slice(0, 20)}...`
                          : report.itemName}
                      </td>
                      <td className="py-4 pr-8">{report.openingQty}</td>
                      <td className="py-4 pr-8">{report.closingQty}</td>
                      <td className="py-4 pr-8">{report.totalQtyDiff}</td>
                      <td className="py-4 pr-8">{report.openingStockValue}</td>
                      <td className="py-4 pr-8">{report.value_change}</td>
                      <td className="py-4 pr-8">{report.openingEmptyQty}</td>
                      <td className="py-4 pr-8">{report.closingEmptyQty}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {!loading && filteredReports.length > itemsPerPage && (
          <div className="flex flex-row justify-between items-center mt-6 gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-50"
            >
              <MoveLeft /> Previous
            </button>

            <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center"></div>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-50"
            >
              Next <MoveRight />
            </button>

            <div className="hidden lg:block text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredReports.length)} of{" "}
              {filteredReports.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessReports;
