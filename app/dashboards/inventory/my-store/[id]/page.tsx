/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  MoveLeft,
  Loader2,
  Search,
  MoveRight,
  CarTaxiFront,
  ShoppingCart,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoreById, getStoreStock } from "@/actions/stores";
import { ThreeDots } from "react-loader-spinner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import StockForm from "../chunks/StockForm";
import { Switch } from "@/components/ui/switch";
import { ClipLoader } from "react-spinners";
import {
  handleUpdateStoreSettings,
  handleUpdateStore,
} from "@/lib/utils/api/apiHelper";
import { toast } from "sonner";
import PlacesAutocompleteInput from "@/hooks/googleMap";

interface Store {
  id: string;
  name: string;
  address: { name: string; lat: number; lng: number };
  phone: string;
  stock_value: number;
  stock_count: number;
  low_stock_count: number;
  is_default?: boolean;
  show_on_marketplace?: boolean;
  is_archived?: boolean;
}

interface StockItem {
  id: string;
  sku: string;
  quantity: string;
  selling_price: string;
  cost_price: string;
  product: {
    name: string;
    image?: string;
  };
  status: string;
}

const StoreDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    is_default: false,
    show_on_marketplace: false,
    is_archived: false,
  });

  const [store, setStore] = useState<Store | null>(null);
  const [editForm, setEditForm] = useState({
    address: { name: "", lat: 0, lng: 0 },
    phone: "",
  });
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set());
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  useEffect(() => {
    if (store) {
      setStoreSettings({
        is_default: store.is_default || false,
        show_on_marketplace: store.show_on_marketplace || false,
        is_archived: store.is_archived || false,
      });
      setEditForm({
        address: {
          name: store.address.name,
          lat: store.address.lat,
          lng: store.address.lng,
        },
        phone: store.phone,
      });
    }
  }, [store]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const fetchData = async () => {
      setIsLoadingStore(true);
      const storeResult = await getStoreById(storeId, token);

      if (storeResult?.data) {
        setStore(storeResult.data);
      } else {
        setError("Failed to load store details");
      }
      setIsLoadingStore(false);

      setIsLoadingStock(true);
      const stockResult = await getStoreStock(storeId, token);

      if (stockResult.success && Array.isArray(stockResult.data)) {
        setStocks(stockResult.data);
      } else {
        setError(stockResult.message || "Failed to load stock items");
      }
      setIsLoadingStock(false);
    };

    if (storeId) {
      fetchData();
    }
  }, [storeId]);

  const handleUpdateStoreDetails = async () => {
    try {
      setIsUpdatingStore(true);

      if (!editForm.address.name.trim()) {
        toast.error("Please enter a valid address");
        return;
      }

      if (!editForm.phone.trim()) {
        toast.error("Please enter a phone number");
        return;
      }

      const response = await handleUpdateStore(storeId, editForm);

      if (response.statusCode === 200) {
        toast.success("Store updated successfully");

        setStore((prev) =>
          prev
            ? {
                ...prev,
                address: response.data.address,
                phone: response.data.phone,
                updatedAt: response.data.updatedAt,
              }
            : null,
        );

        setIsEditOpen(false);
      } else {
        toast.error(response.error || "Failed to update store");
      }
    } catch (error: any) {
      console.error("Update store error:", error);
      toast.error(error?.message || "Failed to update store");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsUpdatingSettings(true);
      const response = await handleUpdateStoreSettings(storeId, storeSettings);

      if (response.statusCode === 200) {
        toast.success("Store settings updated successfully");
        setStore((prev) =>
          prev
            ? {
                ...prev,
                ...response.data,
              }
            : null,
        );
        setIsSettingsOpen(false);
      } else {
        toast.error(response.error || "Failed to update settings");
      }
    } catch (error: any) {
      console.error("Update settings error:", error);
      toast.error(error?.message || "Failed to update settings");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleSelectStock = (stockId: string) => {
    setSelectedStocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stockId)) {
        newSet.delete(stockId);
      } else {
        newSet.add(stockId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStocks.size === stocks.length) {
      setSelectedStocks(new Set());
    } else {
      setSelectedStocks(new Set(stocks.map((s) => s.id)));
    }
  };

  const handleMoveSelected = () => {
    const selectedStockItems = stocks.filter((s) => selectedStocks.has(s.id));

    // Store selected stocks in sessionStorage to pass to move page
    sessionStorage.setItem(
      "selectedStocksToMove",
      JSON.stringify(selectedStockItems),
    );

    // Navigate to move stock page
    router.push(`/dashboards/inventory/my-store/${storeId}/moveStock`);
  };

  if (isLoadingStore || isLoadingStock) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ThreeDots height="80" width="80" color="#0A6DC0" visible={true} />
        <p className="mt-4 text-[#9E9A9A]">Loading store & stock details...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error || "Store not found"}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#0A6DC0] underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors "
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F] dark:text-white">
            {store.name}
          </h1>
          <p className="text-[16px] font-dm-sans text-[#9E9A9A] dark:text-gray-400">
            Here are all the details about this store
          </p>
        </div>

        <Button
          onClick={() => setIsAddStockOpen(true)}
          className="bg-[#0A6DC0] hover:bg-[#09599a] py-5 md:py-6"
        >
          + Add Stock
        </Button>
      </div>

      {/* Stock Value Card */}
      <div className="bg-[url('/balance-bg.svg')] my-6 bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Image src="/value.svg" alt="value" width={20} height={20} />
            <span className="text-white font-dm-sans">Stock Value</span>
          </div>
          <p className="text-[18px] md:text-[20px] font-clash text-white">
            ₦{store.stock_value.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Store Info Card */}
      <div className="mt-6 md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-6 mt-6">
          <div className="space-y-2">
            <Label
              htmlFor="store-name"
              className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300"
            >
              Store Name
            </Label>
            <Input
              id="store-name"
              value={store.name}
              readOnly
              className="bg-[#F9F9F9] py-5 md:py-6 cursor-default"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="store-address"
              className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300"
            >
              Address
            </Label>
            <Input
              id="store-address"
              value={store.address.name}
              readOnly
              className="bg-[#F9F9F9] py-5 md:py-6 cursor-default"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="store-phone"
              className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300"
            >
              Phone
            </Label>
            <Input
              id="store-phone"
              value={store.phone}
              readOnly
              className="bg-[#F9F9F9] py-5 md:py-6 cursor-default"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="product-count"
              className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300"
            >
              Product Count
            </Label>
            <Input
              id="product-count"
              value={store.stock_count}
              readOnly
              className="bg-[#F9F9F9] py-5 md:py-6 cursor-default"
            />
          </div>

          {store.low_stock_count > 0 && (
            <div className="col-span-1 sm:col-span-2 mt-2">
              <p className="text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {store.low_stock_count} items low in stock
              </p>
            </div>
          )}
        </div>

        {/* <div className="space-y-2 font-dm-sans mt-8">
          <div className="text-[#2F2F2F]  flex justify-between items-center">
            <p className="font-bold text-[13px] md:text-[16px]">
              Payment Options
            </p>
            <button className="text-[#0A6DC0] font-bold text-[13px] md:text-[16px]">
              + New Payment Method
            </button>
          </div>
          <div className="flex justify-between items-center border border-[#D8D8D866] dark:border-gray-700 p-2 rounded-lg">
            <p className="text-[13px] md:text-[16px]">Opay POS</p>
            <Trash2 color="#9E9A9A" size={20} />
          </div>
          <div className="flex justify-between items-center border border-[#D8D8D866] dark:border-gray-700 p-2 rounded-lg">
            <p className="text-[13px] md:text-[16px]">Ajo POS</p>
            <Trash2 color="#9E9A9A" size={20} />
          </div>
        </div> */}

        <div className="flex items-center justify-between mt-8 gap-4">
          <Button
            onClick={() => setIsEditOpen(true)}
            className="bg-[#0A6DC0] hover:bg-[#09599a] w-full py-5 md:py-6"
          >
            Edit Store
          </Button>
          <Button
            variant="outline"
            className="w-full py-5 md:py-6 bg-white dark:bg-gray-900"
            onClick={() => setIsSettingsOpen(true)}
          >
            Store Settings
          </Button>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="mt-8 md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
        <div className="flex justify-between items-center my-3">
          <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
            Products in Store ({stocks.length})
          </h2>
          <Button
            className="bg-[#0A2540] hover:bg-[#304c6a] py-5 md:py-6"
            disabled={selectedStocks.size === 0}
            onClick={handleMoveSelected}
          >
            Move Selected ({selectedStocks.size})
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-[#313131]" />
          <Input
            placeholder="Search products..."
            className="bg-[#F2F2F7] pl-10 py-6"
          />
        </div>

        {isLoadingStock ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-[#0A6DC0]" />
            <p className="mt-4 text-[#9E9A9A] dark:text-gray-400">
              Loading stock items...
            </p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mt-4 font-bold text-[16px] text-[#2F2F2F] dark:text-white">
              No stock items found
            </p>
            <p className="text-[#9E9A9A] dark:text-gray-400 mt-2">
              Add stock to see items here
            </p>
            <Button
              onClick={() => setIsAddStockOpen(true)}
              className="bg-[#0A6DC0] hover:bg-[#09599a] mt-2"
            >
              + Add Stock
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto lg:border border-[#E4E4E4] rounded-[20px] bg-white">
            <table className="w-full">
              <thead className="border-b border-[#E6E6E6]">
                <tr className="border-b">
                  <th className="text-left py-3 md:pl-4 font-medium text-[#2F2F2F] dark:text-gray-300">
                    <Checkbox
                      checked={
                        selectedStocks.size === stocks.length &&
                        stocks.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      className="h-[20px] w-[20px]"
                    />
                  </th>
                  <th className="text-left py-3 font-medium text-[#2F2F2F] dark:text-gray-300">
                    SKU
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium text-[#2F2F2F] dark:text-gray-300">
                    Quantity
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium text-[#2F2F2F] dark:text-gray-300">
                    Selling Price
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium text-[#2F2F2F] dark:text-gray-300">
                    Cost Price
                  </th>
                  {/* <th className="text-left py-3 font-medium text-[#2F2F2F] dark:text-gray-300">
                    Action
                  </th> */}
                  <th className="text-left py-3 font-medium text-[#2F2F2F] dark:text-gray-300">
                    More
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {stocks.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors font-medium font-dm-sans text-[16px] text-[#2F2F2F]"
                  >
                    <td className="py-4 md:pl-4">
                      <Checkbox
                        checked={selectedStocks.has(item.id)}
                        onCheckedChange={() => handleSelectStock(item.id)}
                        className="h-[20px] w-[20px]"
                      />
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-[#2F2F2F]">{item.sku}</p>
                    </td>
                    <td className="hidden md:table-cell py-4 font-medium text-[#2F2F2F]">
                      {parseFloat(item.quantity).toFixed(0)}
                    </td>
                    <td className="hidden md:table-cell py-4 font-medium text-[#2F2F2F]">
                      ₦{parseFloat(item.selling_price).toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell py-4 font-medium text-[#2F2F2F]">
                      ₦{parseFloat(item.cost_price).toLocaleString()}
                    </td>
                    {/* <td className="hidden md:table-cell py-4 font-medium text-[#2F2F2F]">
                      <Trash2 color="#FF3B30" />{" "}
                    </td> */}
                    <td className="py-4">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboards/inventory/my-store/${storeId}/stock/${item.id}`,
                          )
                        }
                        className="text-[#0A6DC0] hover:text-[#09599a] underline font-medium"
                      >
                        <MoveRight className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Store Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white font-dm-sans">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-[20px] font-clash font-semibold text-[#2F2F2F] dark:text-white">
                Edit Store
              </DialogTitle>
            </div>
            <p className="text-[#9E9A9A]">Update your store information</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Address Field */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300"
              >
                Store Address
              </Label>
              <PlacesAutocompleteInput
                placeholder="Enter store address"
                value={editForm.address.name}
                onChange={(addressData) => {
                  if (typeof addressData === "string") {
                    setEditForm((prev) => ({
                      ...prev,
                      address: {
                        name: addressData,
                        lat: prev.address.lat || 0,
                        lng: prev.address.lng || 0,
                      },
                    }));
                  } else {
                    setEditForm((prev) => ({
                      ...prev,
                      address: addressData,
                    }));
                  }
                }}
                className="bg-[#F3F4F6] h-12"
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="bg-[#F3F4F6] h-12"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              className="w-full py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#09599a]"
              onClick={handleUpdateStoreDetails}
              disabled={
                isUpdatingStore ||
                !editForm.address.name.trim() ||
                !editForm.phone.trim()
              }
            >
              {isUpdatingStore ? (
                <ClipLoader size={20} color="#ffffff" />
              ) : (
                "Update Store"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Store Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white font-dm-sans">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-clash font-semibold text-[#2F2F2F] dark:text-white">
              Store Settings
            </DialogTitle>
            <p className="text-[#9E9A9A]">Manage your settings here</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Set as Default Store */}
            <div className="flex items-center justify-between space-x-2">
              <p className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300">
                Make Default Store
              </p>

              <Switch
                id="is_default"
                checked={storeSettings.is_default}
                onCheckedChange={(checked) =>
                  setStoreSettings((prev) => ({
                    ...prev,
                    is_default: checked,
                  }))
                }
              />
            </div>

            {/* Show on Marketplace */}
            <div className="flex items-center justify-between space-x-2">
              <p className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300">
                Show Store Contents on Marketplace
              </p>
              <Switch
                id="show_on_marketplace"
                checked={storeSettings.show_on_marketplace}
                onCheckedChange={(checked) =>
                  setStoreSettings((prev) => ({
                    ...prev,
                    show_on_marketplace: checked,
                  }))
                }
              />
            </div>

            {/* Archive Store */}
            <div className="flex items-center justify-between space-x-2">
              <p className="text-sm font-medium text-[#2F2F2F] dark:text-gray-300">
                Temporary Archive Store{" "}
              </p>
              <Switch
                id="is_archived"
                checked={storeSettings.is_archived}
                onCheckedChange={(checked) =>
                  setStoreSettings((prev) => ({
                    ...prev,
                    is_archived: checked,
                  }))
                }
              />
            </div>
          </div>

          <div className=" pt-4">
            <Button
              className="w-full py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#09599a]"
              onClick={handleSaveSettings}
              disabled={isUpdatingSettings}
            >
              {isUpdatingSettings ? (
                <ClipLoader size={20} color="#ffffff" />
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-clash font-semibold text-[#2F2F2F] dark:text-white">
              Add Stock to {store.name}
            </DialogTitle>
          </DialogHeader>
          <StockForm
            storeId={store.id}
            onSuccess={() => {
              setIsAddStockOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreDetailPage;
