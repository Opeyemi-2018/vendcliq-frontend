/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { handleGetPurchasedInvoices } from "@/lib/utils/api/apiHelper";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import { MoveRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { PurchasedInvoice } from "@/types/purchase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

const PurchasedInvoicesPage = () => {
  const [invoices, setInvoices] = useState<PurchasedInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<PurchasedInvoice[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await handleGetPurchasedInvoices();

      if (response.statusCode === 200 && Array.isArray(response.data)) {
        setInvoices(response.data);
        setFilteredInvoices(response.data);
      } else {
        setError(response.error || "Failed to load invoices");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Network error");
      console.error("Fetch invoices error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInvoices(invoices);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = invoices.filter(
      (invoice) =>
        invoice.code.toLowerCase().includes(query) ||
        invoice.status.toLowerCase().includes(query) ||
        invoice.total.toString().includes(query) ||
        format(new Date(invoice.created_at), "dd/MM/yyyy HH:mm").includes(
          query,
        ),
    );

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [searchQuery, invoices]);

  // Calculate pagination
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 ${
            currentPage === i
              ? "bg-[#0A6DC0] text-white hover:bg-[#0A6DC0]"
              : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      );
    }

    return pages;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
            My Purchases
          </h1>
          <p className="hidden md:inline font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            Upload your purchase details here
          </p>
        </div>
        <Button
          onClick={() => router.push("/add-purchase")}
          className="bg-[#0A6DC0] hover:bg-[#09599a]  text-[13px] md:text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6 text-white"
        >
          + Upload Purchase
        </Button>
      </div>

      <div className="md:p-5 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by invoice code, status, amount or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-6"
          />
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Found {filteredInvoices.length} invoice(s)
            </p>
          )}
        </div>
        <div className="overflow-x-auto border border-[#E4E4E4] rounded-[20px]">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <ClipLoader size={40} color="#0A6DC0" />
                      <p className="text-gray-500 text-sm">
                        Loading invoices...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchQuery
                      ? "No invoices match your search"
                      : "No invoices found"}
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/my-purchase/${invoice.id}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.code}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      {formatDate(invoice.created_at)}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <MoveRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && filteredInvoices.length > 0 && (
          <div className="flex flex-row justify-between items-center mt-6 gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24"
            >
              <ChevronLeft size={16} /> Previous
            </Button>

            <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
              {renderPagination()}
            </div>

            <div className="flex items-center gap-10">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24"
              >
                Next <ChevronRight size={16} />
              </Button>

              <div className="hidden lg:block text-sm text-gray-600">
                Showing {startIndex + 1} -{" "}
                {Math.min(startIndex + itemsPerPage, filteredInvoices.length)}{" "}
                of {filteredInvoices.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedInvoicesPage;
