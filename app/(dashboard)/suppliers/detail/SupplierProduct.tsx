"use client";

import { Supplier } from "@/types/supplier";
import { SupplierStockItem, getSupplierStocks } from "@/actions/suppliers";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  Package,
  Loader2,
  Search,
  MoveLeft,
  MoveRight,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SupplierProductsProps {
  supplier: Supplier;
  onBack: () => void;
}

export function SupplierProducts({ supplier, onBack }: SupplierProductsProps) {
  const router = useRouter();

  const [stocks, setStocks] = useState<SupplierStockItem[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchSupplierStocks = async () => {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      if (!token) {
        setStocksError("No authentication token found");
        setLoadingStocks(false);
        return;
      }

      setLoadingStocks(true);
      setStocksError(null);

      const result = await getSupplierStocks(supplier.user_id, token);

      if (result.success && result.data) {
        setStocks(result.data);
      } else {
        setStocksError(result.error || "Failed to load supplier stocks");
      }

      setLoadingStocks(false);
    };

    fetchSupplierStocks();
  }, [supplier.user_id]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);

    if (value.trim() === "") {
      return;
    }

    const filtered = stocks.filter(
      (stock) =>
        stock.product.name.toLowerCase().includes(value.toLowerCase()) ||
        stock.sku.toLowerCase().includes(value.toLowerCase()),
    );

    if (filtered.length === 0) {
      toast.error("No matching products found");
    }
  };

  const getFilteredStocks = () => {
    if (searchTerm.trim() === "") {
      return stocks;
    }

    const filtered = stocks.filter(
      (stock) =>
        stock.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return filtered.length > 0 ? filtered : stocks;
  };

  const filteredStocks = getFilteredStocks();

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStocks = filteredStocks.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Navigate to marketplace detail page - same as MarketPlace component
  const handleViewInMarket = (stockId: string) => {
    router.push(`/market-place/${stockId}`);
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <ArrowLeft onClick={onBack} className="w-5 h-5 mb-2 cursor-pointer" />
          <div className="mb-6">
            <h1 className="font-clash text-[16px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
              {supplier.name} - Products
            </h1>
            <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
              All products available from this supplier
            </p>
          </div>
        </div>
      </div>

      <Card className="md:p-4 lg:p-8 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 py-5 w-full sm:w-64"
            />
          </div>
        </div>

        {loadingStocks ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-[#0A6DC0]" />
            <p className="mt-4 text-[#9E9A9A] dark:text-gray-400">
              Loading supplier products...
            </p>
          </div>
        ) : stocksError ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">{stocksError}</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-[#2F2F2F] dark:text-white font-medium">
              No products available
            </p>
            <p className="text-[#9E9A9A] dark:text-gray-400 mt-2">
              This supplier has no products listed
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-[#F9F9F9]">
                  <tr>
                    <th className="text-left py-3 pl-4 font-medium font-dm-sans">
                      Product
                    </th>
                    <th className="text-left py-3 font-medium font-dm-sans">
                      SKU
                    </th>
                    <th className="text-left py-3 font-medium font-dm-sans">
                      Quantity
                    </th>
                    <th className="text-left py-3 font-medium font-dm-sans">
                      Price
                    </th>
                    <th className="text-left py-3 font-medium font-dm-sans">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentStocks.map((stock) => (
                    <tr
                      key={stock.id}
                      className="hover:bg-gray-50 transition-colors font-dm-sans"
                    >
                      <td className="w-1/5 py-4 pl-2 md:pl-4 font-medium">
                        <div className="flex gap-2 items-center min-w-0">
                          {stock.product.images ? (
                            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                              <Image
                                src={
                                  stock.product.images.startsWith("//")
                                    ? `https:${stock.product.images}`
                                    : stock.product.images
                                }
                                alt={stock.product.name}
                                width={40}
                                height={40}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}

                          <p className="truncate lowercase">
                            {stock.product.name}
                          </p>
                        </div>
                      </td>

                      <td className="w-1/5 py-4 truncate lowercase">
                        {stock.sku}
                      </td>
                      <td className="w-1/5 py-4">{stock.quantity}</td>
                      <td className="w-1/5 py-4 truncate">
                        ₦{parseFloat(stock.selling_price).toLocaleString()}
                      </td>
                      <td className="w-1/5 py-4">
                        <button
                          onClick={() => handleViewInMarket(stock.id)}
                          className="text-[#0A6DC0] hover:text-[#085a9e] font-bold transition-colors"
                        >
                          View In Market
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredStocks.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-[#0A6DC0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MoveLeft className="w-4 h-4" />
                  Previous
                </button>

                <p className="text-[14px] text-[#0A6DC0] font-dm-sans">
                  Page {currentPage} of {totalPages} ({filteredStocks.length}{" "}
                  products)
                </p>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 text-[#0A6DC0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <MoveRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
