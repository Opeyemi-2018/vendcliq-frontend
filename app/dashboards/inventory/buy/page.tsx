"use client";
import { getSuppliers } from "@/actions/suppliers-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import { Supplier } from "@/types/supplier-types";
import {
  ChevronRight,
  Search,
  ShoppingCart,
  Truck,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const Buy = () => {
  const [stage, setStage] = useState<
    "select-supplier" | "supplier-info" | "invoice"
  >("select-supplier");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("authToken");

    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getSuppliers(token);

    if (result.success) {
      setSuppliers(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (stage === "select-supplier") {
    return (
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Buy
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Buy stock from suppliers
        </p>

        <div className="mt-8 flex flex-col lg:flex-row gap-4">
          {/* Left Card - Store Selection */}
          <Card className="py-6 px-4 w-full lg:w-[35%] bg-white">
            <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
              Select where to buy from
            </h1>
            <Separator
              orientation="horizontal"
              className="h-[1px] mt-3"
              style={{ background: "#E0E0E0" }}
            />

            <div className="mt-3 flex items-center gap-2 justify-between border border-[#D8D8D866] rounded-lg px-3 py-2">
              <Truck size={30} className="shrink-0" />
              <div>
                <p className="text-[#2F2F2F] font-dm-sans font-medium">
                  Buy from Suppliers
                </p>
                <p className="text-[#2F2F2F] text-[13px] font-regular">
                  Buy from other suppliers near you, that are also on the
                  Vendcliq network.
                </p>
              </div>
              <ChevronRight />
            </div>
            <div className="mt-3 flex items-center gap-2 justify-between border border-[#D8D8D866] rounded-lg px-3 py-2">
              <ShoppingCart size={30} className="shrink-0" />

              <div>
                <p className="text-[#2F2F2F] font-dm-sans font-medium">
                  Buy from Marketplace
                </p>
                <p className="text-[#2F2F2F] text-[13px] font-regular">
                  Place an order on the marketplace and receive bids from
                  vendors around you.
                </p>
              </div>
              <ChevronRight />
            </div>
          </Card>

          {/* Right Card - Supplier Options */}
          <Card className="py-6 px-4 w-full lg:w-[70%] bg-white">
            <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
              Buy from Suppliers
            </h1>
            <p className="text-[#9E9A9A] font-dm-sans">
              Search and select suppliers you want to buy from
            </p>
            <Separator
              orientation="horizontal"
              className="h-[1px] mt-3"
              style={{ background: "#E0E0E0" }}
            />

            <div className="relative mt-6">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Type to search"
                className="pl-10  border-2 bg-[#F2F2F7] "
                // value={searchTerm}
                // onChange={(e) => setSearchTerm(e.target.value)}
                // disabled={isLoadingStores || !!error}
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="mt-6 text-center py-8">
                <div className="inline-block">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-gray-500">Loading suppliers...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <Button
                  onClick={fetchSuppliers}
                  className="mt-2 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Suppliers List */}
            {!loading && !error && suppliers.length > 0 && (
              <div className="mt-6 space-y-4">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setStage("supplier-info");
                      // You might want to store the selected supplier
                      console.log("Selected supplier:", supplier);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {supplier.logo ? (
                          <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden">
                            <img
                              src={supplier.logo}
                              alt={supplier.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-600">
                              {supplier.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {supplier.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {supplier.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            {supplier.phone}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {supplier.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && suppliers.length === 0 && (
              <div className="mt-6 text-center py-8">
                <div className="text-gray-400">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h2 className="mt-4 text-xl font-semibold">
                    No Suppliers Found
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Add suppliers to start purchasing inventory
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-4">
              <Button className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] h-12">
                Proceed
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
};

export default Buy;
