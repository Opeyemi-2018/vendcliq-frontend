"use client";
import { getSuppliers } from "@/actions/suppliers";
import { Input } from "@/components/ui/Input";
import { Supplier } from "@/types/supplier";
import { MoveRight, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { ThreeDots } from "react-loader-spinner";
import { toast } from "sonner";
import { SupplierFullDetails } from "./detail/SupplierInfo";
import { SupplierProducts } from "./detail/SupplierProduct";

export default function Suppliers() {
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"details" | "products">("details");

  const fetchSuppliers = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getSuppliers(token);

    if (result.success) {
      setSuppliers(result.data || []);
    } else {
      setError(result.error || "Failed to load suppliers");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) {
      return suppliers;
    }

    const term = searchTerm.toLowerCase().trim();
    return suppliers.filter((supplier) =>
      supplier.name?.toLowerCase().includes(term),
    );
  }, [suppliers, searchTerm]);

  // Show toast when search doesn't match
  useEffect(() => {
    if (loading || suppliers.length === 0 || !searchTerm.trim()) {
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const hasMatch = suppliers.some((supplier) =>
      supplier.name?.toLowerCase().includes(term),
    );

    if (!hasMatch) {
      toast.error("Your search did not match any supplier name.");
    }
  }, [searchTerm, suppliers, loading]);

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewMode("details");
  };

  const handleBackToList = () => {
    setSelectedSupplier(null);
    setViewMode("details");
  };

  const handleViewProducts = () => {
    setViewMode("products");
  };

  const handleBackToSupplier = () => {
    setViewMode("details");
  };

  // If a supplier is selected, show either details or products
  if (selectedSupplier) {
    if (viewMode === "products") {
      return (
        <div className="min-h-screen">
          <SupplierProducts
            supplier={selectedSupplier}
            onBack={handleBackToSupplier}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <SupplierFullDetails
          supplier={selectedSupplier}
          onBack={handleBackToList}
          onViewProducts={handleViewProducts}
        />
      </div>
    );
  }

  // Otherwise, show the supplier list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
          Supplier List
        </h1>
        <p className=" font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
          See all the available stock and prices from suppliers to plan
          purchases or compare deals.
        </p>
      </div>

      {/* API error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-5 py-4 text-red-700 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search by supplier name..."
            className="bg-[#F2F2F7] pl-10 py-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="md:p-6 lg:border bg-white border-[#E4E4E4] rounded-lg ">
          <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold mb-4">
            Supplier List {!loading && `(${filteredSuppliers.length})`}
          </h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ThreeDots height="80" width="80" color="#0A6DC0" visible />
              <p className="mt-5 text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                Loading suppliers...
              </p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-16">
              <Image
                src="/store.svg"
                alt="No suppliers"
                height={90}
                width={90}
              />
              <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                {searchTerm.trim()
                  ? "No matching suppliers found"
                  : "No supplier found"}
              </p>
              <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans text-center max-w-md">
                {searchTerm.trim()
                  ? "Try a different search term"
                  : "Your suppliers will appear here once added"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-dm-sans text-[#2F2F2F] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#E6E6E6]">
                    <tr>
                      <th className="text-left py-3 pl-4 font-medium font-dm-sans">
                        Name
                      </th>
                      <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans">
                        Address
                      </th>
                      <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans">
                        Email
                      </th>
                      <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans">
                        Phone
                      </th>
                      <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans">
                        Type
                      </th>
                      <th className="text-left py-3 font-medium font-dm-sans">
                        More
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSuppliers.map((supplier) => (
                      <tr
                        key={supplier.id}
                        onClick={() => handleSupplierClick(supplier)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors font-dm-sans"
                      >
                        <td className="py-4 pl-2 md:pl-4 font-medium whitespace-nowrap">
                          {supplier.name?.substring(0, 10) ?? "—"}...
                        </td>
                        <td className="hidden md:table-cell py-4">
                          {(supplier.address ?? "").substring(0, 10)}...
                          {supplier.state && `, ${supplier.state}`}
                        </td>
                        <td className="hidden md:table-cell py-4">
                          {supplier.email?.substring(0, 12) ?? "—"}...
                        </td>
                        <td className="hidden md:table-cell py-4">
                          {supplier.phone || "—"}
                        </td>
                        <td className="hidden md:table-cell py-4">
                          {supplier.type || "—"}
                        </td>
                        <td className="py-4">
                          <MoveRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
