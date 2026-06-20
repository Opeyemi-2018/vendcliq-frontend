"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoveLeft, MoveRight, Package } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns";
import { useStockMovements } from "@/hooks/useStores";

const StockHistoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const stockId = params.stockId as string;

  const { data: movements = [], isLoading, error, refetch } = useStockMovements(stockId);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalItems = movements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedMovements = movements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getMovementSign = (type: string) => {
    if (type === "Sale" || type === "Removed") return "-";
    if (type === "Added") return "+";
    return "";
  };

  const getProductImage = (movement: any) => {
    const img = movement.meta?.image || movement.stock?.product?.image;
    return img?.startsWith("//") ? `https:${img}` : img || null;
  };

  const getProductName = (movement: any) => {
    return movement.meta?.product_name || movement.stock?.product?.name || "Unknown Product";
  };

  const getStatus = (movement: any) => {
    const status = movement.stock?.status;
    return status === "in_stock" ? "In Stock" : status || "—";
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase() === "in_stock") return "text-green-600 bg-green-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="text-[#2F2F2F]">
      <button onClick={() => router.back()}>
        <MoveLeft className="h-5 w-5" />
      </button>
      <div className="mb-4">
        <h1 className="font-clash text-[20px] md:text-[25px] font-semibold">Stock History</h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A]">Track your stock performance on Vendorhub</p>
      </div>

      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white mb-3 md:mb-5">
        <div className="overflow-hidden lg:border border-[#E4E4E4] rounded-[20px] bg-white">
          <div className="relative min-h-[400px]">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ClipLoader color="#0A6DC0" size={50} />
                <p className="mt-4 text-[#9E9A9A] font-dm-sans">Loading movements...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <p className="text-red-600 text-center">{error.message}</p>
                <Button onClick={() => refetch()} className="bg-[#0A6DC0] hover:bg-[#09599a]">
                  Retry
                </Button>
              </div>
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-20">
                <Package size={60} className="text-gray-400" />
                <p className="font-bold font-dm-sans text-[16px]">No movement history</p>
                <p className="text-[#9E9A9A] font-dm-sans">Stock movements will appear here</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-[#E6E6E6]">
                      <tr>
                        <th className="text-left py-3 pl-4 font-medium font-dm-sans">Product</th>
                        <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans">Status</th>
                        <th className="text-left py-3 font-medium font-dm-sans">Quantity</th>
                        <th className="text-left py-3 font-medium font-dm-sans">Total (Balance)</th>
                        <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans">Type</th>
                        <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E4]">
                      {paginatedMovements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-gray-50">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-2">
                              {getProductImage(movement) ? (
                                <Image src={getProductImage(movement)!} alt={getProductName(movement)} width={10} height={10} className="rounded-md" />
                              ) : (
                                <Package className="text-gray-400" />
                              )}
                              <div className="font-medium font-dm-sans">{getProductName(movement)}</div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(getStatus(movement))}`}>
                              {getStatus(movement)}
                            </span>
                          </td>
                          <td className="py-4 font-medium">
                            {getMovementSign(movement.movement_type)}
                            {movement.quantity}
                          </td>
                          <td className="py-4 font-medium font-dm-sans">{movement.balance}</td>
                          <td className="hidden md:table-cell py-4 font-medium font-dm-sans">{movement.movement_type}</td>
                          <td className="hidden md:table-cell py-4 font-medium font-dm-sans">
                            {format(new Date(movement.created_at), "MMM dd, yyyy • hh:mm a")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalItems > itemsPerPage && (
                  <div className="flex flex-row justify-between items-center mt-6 gap-4 px-4">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-50"
                    >
                      <MoveLeft /> Previous
                    </button>
                    <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? "default" : "outline"}
                          className={currentPage === page ? "bg-[#0A6DC0] text-white hover:bg-[#0A6DC0]" : ""}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-50"
                    >
                      Next <MoveRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryPage;