"use client";
import { getSuppliers, getSupplierStock } from "@/actions/suppliers";
import { getStores } from "@/actions/stores";

import { handleCreateInvoice } from "@/lib/utils/api/apiHelper"; // Adjust if you have a separate purchase endpoint
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import { Supplier } from "@/types/supplier";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  Truck,
  Building,
  Phone,
  Mail,
  UserRound,
  Wallet,
  MapPin,
  MoveLeft,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StoreType {
  id: string;
  name: string;
  stock_value: string;
  stock_count: string;
}

interface StockItem {
  id: string;
  sku: string;
  product: {
    name: string;
    images: string;
  };
  // ... possibly available_quantity, price, etc.
}

interface InvoiceItem {
  stock_id: string;
  product_name: string;
  quantity: number;
  mode: "PACKS" | "PIECES";
  discounted_amount: number;
  empties?: { type: "CREDIT" | "SELL"; quantity: number };
}

const Buy = () => {
  const [stage, setStage] = useState<
    "select-supplier" | "supplier-info" | "Store" | "invoice"
  >("select-supplier");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [stores, setStores] = useState<StoreType[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreType[]>([]);
  const [searchStore, setSearchStore] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSupplier, setFilteredSupplier] = useState<Supplier[]>([]);
  const [supplierStock, setSupplierStock] = useState<StockItem[]>([]);
  const [isLoadingSupplierStock, setIsLoadingSupplierStock] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  const router = useRouter();

  const invoiceForm = useForm({
    defaultValues: {
      stock_id: "",
      quantity: "",
      mode: "PACKS",
      discounted_amount: "",
      empties_type: "",
      empties_quantity: "",
    },
  });

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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredSupplier(suppliers);
    } else {
      const filtered = suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSupplier(filtered);
    }
  }, [searchTerm, suppliers]);

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoadingStores(true);
      setStoreError(null);
      try {
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");
        if (!token) {
          setStoreError("Please log in");
          return;
        }
        const result = await getStores(token);
        if (result.success && result.data) {
          const storeNames = result.data.map((store: any) => ({
            id: store.id,
            name: store.name,
            stock_count: store.stock_count,
            stock_value: store.stock_value?.toLocaleString() || "0",
          }));
          setStores(storeNames);
          setFilteredStores(storeNames);
        } else {
          setStoreError(result.error || "Failed to load stores");
        }
      } catch (err) {
        setStoreError("Network error");
      } finally {
        setIsLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    if (searchStore === "") {
      setFilteredStores(stores);
    } else {
      setFilteredStores(
        stores.filter((s) =>
          s.name.toLowerCase().includes(searchStore.toLowerCase())
        )
      );
    }
  }, [searchStore, stores]);

  // Fetch stock when entering invoice stage
  useEffect(() => {
    if (stage === "invoice" && selectedSupplier) {
      // ← changed from selectedStore
      const fetchSupplierStock = async () => {
        setIsLoadingSupplierStock(true);
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken");
          if (!token) {
            toast.error("Authentication required");
            return;
          }

          const result = await getSupplierStock(
            token,
            selectedSupplier.user_id
          );

          if (result.success && result.data) {
            setSupplierStock(result.data);
          } else {
            toast.error(result.error || "Failed to load supplier's stock");
          }
        } catch (err) {
          toast.error("Network error while loading supplier stock");
        } finally {
          setIsLoadingSupplierStock(false);
        }
      };

      fetchSupplierStock();
    }
  }, [stage, selectedSupplier]); // ← dependency changed

  const addItemToInvoice = () => {
    const values = invoiceForm.getValues();

    if (!values.stock_id || !values.quantity) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    const stockItem = supplierStock.find((s) => s.id === values.stock_id);
    if (!stockItem) return;

    const newItem: InvoiceItem = {
      stock_id: values.stock_id,
      product_name: stockItem.sku,
      quantity: parseInt(values.quantity, 10),
      mode: values.mode as "PACKS" | "PIECES",
      discounted_amount: parseFloat(values.discounted_amount || "0"),
      empties: values.empties_type
        ? {
            type: values.empties_type as "CREDIT" | "SELL",
            quantity: parseInt(values.empties_quantity || "0", 10),
          }
        : undefined,
    };

    setInvoiceItems((prev) => [...prev, newItem]);
    toast.success("Item added to invoice");

    invoiceForm.reset({
      stock_id: "",
      quantity: "",
      mode: "PACKS",
      discounted_amount: "",
      empties_type: "",
      empties_quantity: "",
    });
  };

  const submitPurchaseInvoice = async () => {
    if (invoiceItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    setIsSubmittingInvoice(true);

    const payload = {
      supplier_id: selectedSupplier!.id,
      store_id: selectedStore!.id,
      items: invoiceItems.map((item) => ({
        stock_id: item.stock_id,
        quantity: item.quantity,
        mode: item.mode,
        discounted_amount: item.discounted_amount,
        empties: item.empties,
      })),
    };

    try {
      const response = await handleCreateInvoice(payload);
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Purchase invoice created successfully!");
        setInvoiceItems([]);
        setStage("select-supplier");
        setSelectedSupplier(null);
        setSelectedStore(null);
      } else {
        toast.error(response.error || "Failed to create purchase invoice");
      }
    } catch (err) {
      toast.error("Failed to create purchase invoice");
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  // Stage 1: Select Supplier (UNCHANGED)
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
          <Card className="py-6 px-4 w-full lg:w-[35%] bg-white">
            <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
              Select where to buy from
            </h1>
            <Separator
              orientation="horizontal"
              className="h-[1px] mt-3"
              style={{ background: "#E0E0E0" }}
            />

            <div className="cursor-pointer hover:bg-[#0A6DC012] mt-3 flex items-center gap-2 justify-between border border-[#D8D8D866] rounded-lg px-3 py-2">
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
            <div
              onClick={() => router.push("/dashboards/market-place")}
              className="cursor-pointer hover:bg-[#0A6DC012] mt-3 flex items-center gap-2 justify-between border border-[#D8D8D866] rounded-lg px-3 py-2"
            >
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

            <div className="relative my-6">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Type to search"
                className="pl-10 border-2 bg-[#F2F2F7]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading || !!error}
              />
            </div>

            {loading ? (
              <div className="mt-6 text-center py-8">
                <div className="inline-block">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-gray-500">Loading suppliers...</p>
              </div>
            ) : error ? (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <Button
                  onClick={fetchSuppliers}
                  className="mt-2 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredSupplier.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No supplier found
              </p>
            ) : (
              filteredSupplier.map((supplier) => (
                <div
                  key={supplier.id}
                  className="mb-4 flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedSupplier(supplier);
                    setStage("supplier-info");
                  }}
                >
                  <div className="flex items-center space-x-4 text-[#2F2F2F]">
                    {supplier.logo ? (
                      <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden">
                        <Image
                          height={50}
                          width={50}
                          src={supplier.logo}
                          alt={supplier.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {supplier.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium capitalize">
                        {supplier.name}
                      </h3>
                      <div className="text-[13px] flex items-center gap-1 text-gray-600">
                        <MapPin size={14} />
                        <span>{supplier.address}</span>
                        <span>|</span>
                        <Phone size={14} />
                        <span>{supplier.phone}</span>
                      </div>
                      <p className="text-[13px] text-gray-600">
                        {supplier.email}
                      </p>
                    </div>
                  </div>
                  <ChevronRight color="#9E9A9A" />
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Stage 2: Supplier Info (UNCHANGED)
  if (stage === "supplier-info" && selectedSupplier) {
    return (
      <div>
        <MoveLeft
          onClick={() => {
            setStage("select-supplier");
            setSelectedSupplier(null);
          }}
          className="mr-2 h-4 w-4 mb-3"
        />

        <h1 className="text-[16px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          {selectedSupplier.name}
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans mb-3">
          All info you need to know about this store
        </p>

        <Card className="p-3 lg:p-8 bg-white">
          <div className="grid md:grid-cols-2 md:gap-y-5 gap-y-2 font-dm-sans text-[#2F2F2F]">
            <div className="font-regular lowercase">
              <p className="font-bold">Supplier Name</p>
              <p>{selectedSupplier.name}</p>
            </div>
            <div className="font-regular lowercase">
              <p className="font-bold">Address</p>
              <p>{selectedSupplier.address}</p>
            </div>
            <div className="font-regular lowercase">
              <p className="font-bold">phone</p>
              <p>{selectedSupplier.phone}</p>
            </div>
            <div className="font-regular lowercase">
              <p className="font-bold">Email Address</p>
              <p>{selectedSupplier.email}</p>
            </div>
            <div className="font-regular lowercase">
              <p className="font-bold">Supplier Type</p>
              <p>{selectedSupplier.type}</p>
            </div>
            <div className="font-regular lowercase">
              <p className="font-bold">Bank</p>
              <p>{selectedSupplier.wallet.bank_name}</p>
            </div>
            <div className="font-regular lowercase">
              <p className="font-bold">Account Number</p>
              <p>{selectedSupplier.wallet.account_number}</p>
            </div>
            <div className="font-regular lowercase">
              <p className="font-bold">Account Name</p>
              <p>{selectedSupplier.wallet.account_name}</p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => setStage("Store")}
            className="bg-[#0A6DC0] hover:bg-[#09599a] py-5 md:py-6 w-full mt-6"
          >
            Proceed
          </Button>
        </Card>
      </div>
    );
  }

  // Stage 3: Select Store (UNCHANGED)
  if (stage === "Store") {
    return (
      <div>
        <MoveLeft
          onClick={() => {
            setStage("supplier-info");
          }}
          className="mr-2 h-4 w-4 mb-3"
        />
        <Card className="p-3 lg:p-8 bg-white">
          <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
            Select the store you want to restock
          </h1>
          <Separator
            orientation="horizontal"
            className="h-[1px] mt-3"
            style={{ background: "#E0E0E0" }}
          />
          <div className="relative mt-6">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Type to search"
              className="pl-10 bg-transparent border-2 border-[#E7EBED]"
              value={searchStore}
              onChange={(e) => setSearchStore(e.target.value)}
              disabled={isLoadingStores || !!error}
            />
          </div>
          <div className="mt-6 space-y-2">
            {isLoadingStores ? (
              <div className="flex items-center gap-2 justify-center">
                <p className="text-center py-4 text-gray-500">
                  Loading stores...
                </p>
                <ThreeDots
                  height="40"
                  width="40"
                  color="#0A6DC0"
                  visible={true}
                />
              </div>
            ) : error ? (
              <div className="">
                <p className="text-center py-4 text-red-500">{error}</p>
                <button
                  className="bg-[#0A6DC0] hover:bg-[#085a9e] flex flex-col justify-center rounded-lg p-2 text-white"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : filteredStores.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No stores found</p>
            ) : (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    setStage("invoice");
                  }}
                  className={`flex justify-between border rounded-lg px-3 py-4 cursor-pointer transition-colors ${
                    selectedStore?.id === store.id
                      ? "bg-[#0A6DC012] border border-[#0A6DC0]"
                      : "bg-gray-50 hover:bg-gray-100 border-[#D8D8D866]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/store.svg"
                      width={20}
                      height={20}
                      alt="store"
                    />
                    <p className="font-medium text-[16px] font-dm-sans text-[#2F2F2F]">
                      {store.name}
                    </p>
                  </div>
                  <ChevronRight />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Stage 4: Invoice Generation (NEW – matches Sell page exactly)
  if (stage === "invoice" && selectedSupplier && selectedStore) {
    return (
      <div>
        <MoveLeft
          onClick={() => {
            setStage("Store");
            setSelectedStore(null);
          }}
          className="mr-2 h-4 w-4 mb-3"
        />
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Create Invoice
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Kindly fill the details below to create invoice
        </p>

        <Card className="py-6 px-4 mt-8 bg-white">
          <div className="mb-2 flex items-center justify-between font-dm-sans font-medium">
            <p className="text-[16px] text-[#000000]">Supplier</p>
            <button
              onClick={() => {
                setStage("select-supplier");
                setSelectedSupplier(null);
                setSelectedStore(null);
              }}
              className="text-[#0A6DC0]"
            >
              Change Supplier
            </button>
          </div>
          <div className="py-3 mb-4 px-5 flex items-center gap-2 font-dm-sans border border-[#0A6DC0] bg-[#0A6DC012] rounded-lg">
            <Truck className="w-8 h-8" />
            <div>
              <p className="text-[#2F2F2F] font-medium capitalize">
                {selectedSupplier.name}
              </p>
              <p className="text-[13px] text-[#2F2F2F]">
                {selectedSupplier.phone} • {selectedSupplier.email}
              </p>
              <p className="text-[13px] text-[#2F2F2F]">
                {selectedSupplier.address}
              </p>
            </div>
          </div>

          <div className="mb-2 font-dm-sans font-medium">
            <p className="text-[16px] text-[#000000]">Restocking Store</p>
          </div>
          <div className="py-3 mb-6 px-5 flex items-center gap-2 font-dm-sans border border-[#0A6DC0] bg-[#0A6DC012] rounded-lg">
            <Image src="/store.svg" alt="store" width={30} height={30} />
            <div>
              <p className="text-[#2F2F2F] font-medium">{selectedStore.name}</p>
              <div className="flex items-center gap-2 text-[13px]">
                <p className="text-[#2F2F2F] font-medium">Inventory value: ₦</p>
                <p className="text-[#9E9A9A]">{selectedStore.stock_value}</p>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <p className="text-[#2F2F2F] font-medium">Product Count:</p>
                <p className="text-[#9E9A9A]">{selectedStore.stock_count}</p>
              </div>
            </div>
          </div>

          <Form {...invoiceForm}>
            <form className="space-y-6 mb-2">
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  control={invoiceForm.control}
                  name="stock_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (from Supplier)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingSupplierStock}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#F3F4F6] h-12">
                            <SelectValue
                              placeholder={
                                isLoadingSupplierStock
                                  ? "Loading supplier stock..."
                                  : "Choose product from supplier"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {supplierStock.length === 0 &&
                          !isLoadingSupplierStock ? (
                            <div className="p-4 text-center text-gray-500">
                              No stock available from this supplier
                            </div>
                          ) : (
                            supplierStock.map((stock) => (
                              <SelectItem key={stock.id} value={stock.id}>
                                <div className="flex gap-3 items-center lowercase text-left">
                                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                    {stock.product?.images && (
                                      <Image
                                        src={stock.product.images}
                                        alt={stock.sku}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{stock.sku}</p>
                                    <p className="text-sm text-gray-500">
                                      {stock.product?.name}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={invoiceForm.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Mode</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <div className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PACKS" id="packs" />
                            <label htmlFor="packs" className="cursor-pointer">
                              Packs/Crates
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PIECES" id="pieces" />
                            <label htmlFor="pieces" className="cursor-pointer">
                              Pieces/Bottles
                            </label>
                          </div>
                        </div>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={invoiceForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 1"
                          {...field}
                          className="bg-[#F3F4F6] h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={invoiceForm.control}
                  name="empties_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empties Type</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <div className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="CREDIT" id="credit" />
                            <label htmlFor="credit" className="cursor-pointer">
                              Credit
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SELL" id="sell" />
                            <label htmlFor="sell" className="cursor-pointer">
                              Sell
                            </label>
                          </div>
                        </div>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={invoiceForm.control}
                  name="discounted_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discounted Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 20"
                          {...field}
                          className="bg-[#F3F4F6] h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={invoiceForm.control}
                  name="empties_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empties Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 3"
                          {...field}
                          className="bg-white h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                onClick={addItemToInvoice}
                type="button"
                className="bg-[#0A6DC0] py-5 md:py-6 hover:bg-[#09599a] mt-3 w-full"
              >
                Add to Invoice
              </Button>
            </form>
          </Form>
        </Card>

        <Card className="mt-5 px-4 pb-6">
          {invoiceItems.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-4">
                Invoice Items ({invoiceItems.length})
              </h3>
              <div className="overflow-x-auto mt-6 border-[#E4E4E4] border-2 bg-white rounded-2xl">
                <table className="w-full my-6">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                        SKU
                      </th>
                      <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                        Qty
                      </th>
                      <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                        Mode
                      </th>
                      <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                        Discount
                      </th>
                      <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoiceItems.map((item, i) => (
                      <tr
                        key={i}
                        className="border-[#E4E4E4] border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="lowercase text-left p-4 py-4 font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                          {item.product_name}
                        </td>
                        <td className="py-4">{item.quantity}</td>
                        <td className="py-4 lowercase">{item.mode}</td>
                        <td className="py-4">₦{item.discounted_amount}</td>
                        <td className="py-4">
                          <button
                            onClick={() => {
                              setInvoiceItems((prev) =>
                                prev.filter((_, index) => index !== i)
                              );
                              toast.success("Item removed from invoice");
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button
            onClick={submitPurchaseInvoice}
            disabled={isSubmittingInvoice || invoiceItems.length === 0}
            className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] mt-8 h-12"
          >
            {isSubmittingInvoice ? (
              <>
                Creating Invoice...{" "}
                <ClipLoader size={20} color="white" className="ml-2" />
              </>
            ) : (
              "Create Invoice"
            )}
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};

export default Buy;
