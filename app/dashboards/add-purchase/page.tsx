"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Trash2, Plus, Upload, CloudUpload } from "lucide-react";
import { toast } from "sonner";
import {
  handleCreatePurchaseWithFile,
  handleGetUserStocks,
} from "@/lib/utils/api/apiHelper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface PurchaseItem {
  stock_id: string;
  quantity: number;
  cost_price: number;
  id?: string;
}

const CreatePurchasePage = () => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [supplier, setSupplier] = useState("");
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setStocksLoading(true);
        const response = await handleGetUserStocks(1, 100);

        if (response.statusCode === 200) {
          setStocks(response.data);
        } else {
          toast.error(response.error || "Failed to fetch stocks");
        }
      } catch (err: any) {
        console.error("Failed to fetch stocks:", err);
        toast.error(err.message || "Failed to load stocks");
      } finally {
        setStocksLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const selectedStock = stocks?.find((s) => s.id === selectedStockId);

  const handleAddItem = () => {
    if (!selectedStockId) return toast.error("Please select a stock");
    if (!quantity || Number(quantity) < 1)
      return toast.error("Please enter a valid quantity (≥ 1)");
    if (!costPrice || Number(costPrice) < 0)
      return toast.error("Please enter a valid cost price");

    const newItem: PurchaseItem = {
      stock_id: selectedStockId,
      quantity: Number(quantity),
      cost_price: Number(costPrice),
      id: Math.random().toString(36).substring(7),
    };

    setItems([...items, newItem]);
    setSelectedStockId("");
    setQuantity("");
    setCostPrice("");
    toast.success("Item added");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Item removed");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setProofOfPayment(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.cost_price, 0);

  const handleCreatePurchase = async () => {
    if (!supplier.trim()) {
      toast.error("Supplier is required");
      return;
    }
    if (!proofOfPayment) {
      toast.error("Please upload proof of payment");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        supplier: supplier.trim(),
        proof_of_payment: {
          url: URL.createObjectURL(proofOfPayment!),
          filename: proofOfPayment!.name,
          mimetype: proofOfPayment!.type,
          size: proofOfPayment!.size,
        },
        items: items.map((item) => ({
          stock_id: item.stock_id,
          quantity: item.quantity,
          cost_price: item.cost_price,
        })),
      };

      const response = await handleCreatePurchaseWithFile(payload);

      if (response.statusCode === 201 || response.data?.code) {
        toast.success(`Purchase created! Invoice: ${response.data?.code}`);
        setSupplier("");
        setProofOfPayment(null);
        setItems([]);
        setSelectedStockId("");
        setQuantity("");
        setCostPrice("");
      } else {
        toast.error(response.error || "Failed to create purchase");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Network error. Please try again.";
      toast.error(errorMsg);
      console.error("Create purchase error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F]">
          Create Purchase
        </h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
          Add purchase items and upload proof of payment
        </p>
      </div>

      <div className="md:p-5 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-medium text-[#2F2F2F] font-dm-sans">
          <div>
            <label className="mb-2">SKU</label>
            <Select
              value={selectedStockId}
              onValueChange={setSelectedStockId}
              disabled={stocksLoading}
            >
              <SelectTrigger className="w-full bg-[#F9F9F9] h-12">
                <SelectValue placeholder="Select stock...">
                  {selectedStock && (
                    <div className="flex items-center gap-2">
                      {selectedStock.product?.image ? (
                        <Image
                          src={selectedStock.product.image}
                          alt={selectedStock.product.name}
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded object-cover border shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded bg-gray-100 text-[10px] flex items-center justify-center shrink-0">
                          ?
                        </div>
                      )}
                      <span className="truncate">
                        {selectedStock.product?.name}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {stocksLoading ? (
                  <div className="py-4 px-2 flex flex-col items-center text-sm text-muted-foreground">
                    Loading stocks...
                  </div>
                ) : stocks?.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No stocks found
                  </div>
                ) : (
                  stocks.map((stock) => (
                    <SelectItem
                      key={stock.id}
                      value={stock.id}
                      className="py-2"
                    >
                      <div className="flex items-center gap-2">
                        {stock.product?.image ? (
                          <Image
                            src={stock.product.image}
                            alt={stock.product.name}
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-md object-cover border shrink-0"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 shrink-0">
                            No img
                          </div>
                        )}
                        <span className="truncate">{stock.product?.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2">Quantity</label>
            <Input
              type="number"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="bg-[#F9F9F9] h-12"
            />
          </div>

          <div>
            <label className="mb-2">Price per unit (NGN)</label>
            <Input
              type="number"
              placeholder="e.g. 2000"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              min="0"
              step="any"
              className="bg-[#F9F9F9] h-12"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2">Supplier (Optional)</label>
            <Input
              placeholder="Enter supplier name or ID"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="bg-[#F9F9F9] h-12"
            />
          </div>
        </div>

        {/* Proof of Payment */}
        <div className="mb-8">
          <label className="mb-2">Proof of Payment</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="proof-of-payment"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label htmlFor="proof-of-payment" className="cursor-pointer">
              {proofOfPayment ? (
                <div className="text-green-600">
                  <p className="font-medium">✓ {proofOfPayment.name}</p>
                  <p className="text-sm text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="flex justify-center items-center flex-col">
                  <CloudUpload color="#9E9A9A" />
                  <p className="mt-2 text-[14px] text-[#0A6DC0] font-semibold">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB — PDF, JPG, PNG
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <Button
          onClick={handleAddItem}
          className="flex items-center gap-2 w-full bg-[#0A6DC0] hover:bg-[#09599a] mb-3"
          disabled={!selectedStockId || !quantity || !costPrice}
        >
          <Plus size={18} />
          Add
        </Button>
      </div>

      {/* Items Table & Create Button */}
      {items.length > 0 && (
        <div className="md:p-5 mt-5 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Added Items ({items.length}) — Total: ₦
            {calculateTotal().toLocaleString()}
          </h3>

          <div className="overflow-x-auto border rounded-lg mb-6">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Cost Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => {
                  const stock = stocks.find((s) => s.id === item.stock_id);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {stock?.product?.name || item.stock_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ₦{item.cost_price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₦{(item.quantity * item.cost_price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id!)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Button
            onClick={handleCreatePurchase}
            disabled={loading}
            className="flex w-full items-center gap-2 px-8 py-6 bg-[#0A6DC0] hover:bg-[#09599a]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Upload size={18} />
                Create Purchase Invoice
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreatePurchasePage;
