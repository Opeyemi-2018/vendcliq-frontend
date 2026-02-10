"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MoveLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getStores, moveStock } from "@/actions/stores";
import Image from "next/image";
import { X } from "lucide-react";

interface StockItem {
  id: string;
  sku: string;
  quantity: string;
  selling_price: string;
  product: {
    name: string;
    image: string;
  };
}

interface Store {
  id: string;
  name: string;
  address: { name: string };
  stock_value: number;
  stock_count: number;
}

const MoveStockPage = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  const [selectedStocks, setSelectedStocks] = useState<StockItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedDestinationStore, setSelectedDestinationStore] = useState<
    string | null
  >(null);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});

  const handleRemoveStock = (stockId: string) => {
    setSelectedStocks((prev) => prev.filter((s) => s.id !== stockId));

    setQuantities((prev) => {
      const updated = { ...prev };
      delete updated[stockId];
      return updated;
    });

    setPrices((prev) => {
      const updated = { ...prev };
      delete updated[stockId];
      return updated;
    });
  };

  useEffect(() => {
    // Get selected stocks from sessionStorage
    const storedStocks = sessionStorage.getItem("selectedStocksToMove");

    if (!storedStocks) {
      toast.error("No stocks selected");
      router.back();
      return;
    }

    const stocks = JSON.parse(storedStocks);
    setSelectedStocks(stocks);

    // Initialize quantities and prices
    const initialQuantities: Record<string, number> = {};
    const initialPrices: Record<string, number> = {};

    stocks.forEach((stock: StockItem) => {
      initialQuantities[stock.id] = parseFloat(stock.quantity);
      initialPrices[stock.id] = parseFloat(stock.selling_price);
    });

    setQuantities(initialQuantities);
    setPrices(initialPrices);

    fetchStores();
  }, [storeId, router]);

  const fetchStores = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsLoadingStores(true);
    const result = await getStores(token);

    if (result.success && Array.isArray(result.data)) {
      // Filter out the current store
      const availableStores = result.data.filter(
        (store: Store) => store.id !== storeId,
      );
      setStores(availableStores);
    } else {
      toast.error("Failed to load stores");
    }
    setIsLoadingStores(false);
  };

  const handleQuantityChange = (stockId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const maxQty = parseFloat(
      selectedStocks.find((s) => s.id === stockId)?.quantity || "0",
    );

    if (numValue > maxQty) {
      toast.error(`Cannot move more than available quantity (${maxQty})`);
      return;
    }

    setQuantities((prev) => ({ ...prev, [stockId]: numValue }));
  };

  const handlePriceChange = (stockId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPrices((prev) => ({ ...prev, [stockId]: numValue }));
  };

  const getTotalValue = () => {
    return selectedStocks.reduce((sum, stock) => {
      const qty = quantities[stock.id] || 0;
      const price = prices[stock.id] || 0;
      return sum + qty * price;
    }, 0);
  };

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handleMove = async () => {
    if (!selectedDestinationStore) {
      toast.error("Please select a destination store");
      return;
    }

    // Validate quantities
    const invalidItems = selectedStocks.filter((stock) => {
      const qty = quantities[stock.id] || 0;
      return qty <= 0 || qty > parseFloat(stock.quantity);
    });

    if (invalidItems.length > 0) {
      toast.error("Please enter valid quantities for all items");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsMoving(true);

    const items = selectedStocks.map((stock) => ({
      stock_id: stock.id,
      quantity: quantities[stock.id] || 0,
      selling_price: prices[stock.id] || 0,
    }));

    const result = await moveStock(selectedDestinationStore, items, token);

    if (result.success) {
      toast.success(
        `Successfully moved ${getTotalQuantity()} items to ${
          stores.find((s) => s.id === selectedDestinationStore)?.name
        }`,
      );

      // Clear sessionStorage
      sessionStorage.removeItem("selectedStocksToMove");

      // Navigate back to store detail page
      router.push(`/dashboards/inventory/my-store/${storeId}`);
    } else {
      toast.error(result.message || "Failed to move stock");
    }

    setIsMoving(false);
  };

  if (selectedStocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-[#2F2F2F]">No stocks to move</p>
        <p className="mt-1 text-[#9E9A9A]">
          You’ve removed all selected products
        </p>

        <Button
          className="mt-6 bg-[#0A6DC0] hover:bg-[#09599a]"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header with Back Button */}
      <div className="">
        <button
          onClick={() => router.back()}
          className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors "
        >
          <MoveLeft className="w-5 h-5" />
        </button>

        <h1 className="font-clash text-[18px] md:text-[25px] font-semibold text-[#2F2F2F] dark:text-white">
          Move Selected to
        </h1>
        <p className="text-[14px] dm:text-[16px] font-dm-sans text-[#9E9A9A] ">
          Edit quantities and prices, then select destination
        </p>
      </div>

      {/* Selected Products */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center mt-4">
          <h3 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
            Products to Move ({selectedStocks.length})
          </h3>
          <p className="text-[16px] text-[#9E9A9A] font-dm-sans">
            Total Value: ₦{getTotalValue().toLocaleString()} | Total Qty:{" "}
            {getTotalQuantity()}
          </p>
        </div>

        {selectedStocks.map((stock) => (
          <div
            key={stock.id}
            className="relative md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white"
          >
            <button
              onClick={() => handleRemoveStock(stock.id)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-red-50 transition"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-[42px] h-[44px] border border-[#E3E3E3] bg-[#FAFAFA] rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={stock.product.image}
                  alt={stock.product.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-medium text-[#2F2F2F]">{stock.sku}</p>
                <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                  Qty in stock: {parseFloat(stock.quantity).toFixed(0)}
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <div>
                  <Label className="text-[13px] font-dm-sans text-[#2F2F2F]">
                    Quantity to move
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max={parseFloat(stock.quantity)}
                    value={quantities[stock.id] || ""}
                    onChange={(e) =>
                      handleQuantityChange(stock.id, e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-dm-sans text-[#2F2F2F]">
                    Price per unit
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={prices[stock.id] || ""}
                    onChange={(e) =>
                      handlePriceChange(stock.id, e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <p className="text-right text-[14px] font-medium text-[#2F2F2F] mt-2">
                Total Amount: ₦
                {(
                  (quantities[stock.id] || 0) * (prices[stock.id] || 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Destination Stores */}
      <div className="mb-8">
        <h3 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F] mb-2">
          Select Destination Store
        </h3>

        {isLoadingStores ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0A6DC0]" />
          </div>
        ) : stores.length === 0 ? (
          <Card className="md:p-8">
            <p className="text-center text-[#9E9A9A]">
              No other stores available
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedDestinationStore === store.id
                    ? "rounded-md bg-[#0A6DC012]"
                    : "bg-[#FFFFFF] border-[#D8D8D866] hover:bg-gray-50"
                }`}
                onClick={() => setSelectedDestinationStore(store.id)}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="/store.svg"
                    alt="store"
                    width={20}
                    height={20}
                    className="grayscale-100 hover:grayscale-0"
                  />
                  <div className="flex-1 font-dm-sans font-regular">
                    <p className="font-medium text-[#2F2F2F]">{store.name}</p>
                    <div className="text-[13px] ">
                      Inventory value: {""}
                      <span className="text-[#9E9A9A]">
                        ₦{store.stock_value.toLocaleString()}
                      </span>{" "}
                      | Product Count:{" "}
                      <span className="text-[#9E9A9A]">
                        {store.stock_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Move Button */}
      <Button
        onClick={handleMove}
        disabled={!selectedDestinationStore || isMoving}
        className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6"
      >
        {isMoving ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Moving Products...
          </>
        ) : (
          "Move Products"
        )}
      </Button>
    </div>
  );
};

export default MoveStockPage;
