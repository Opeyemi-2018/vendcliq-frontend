/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getSuppliers } from "@/actions/suppliers";
import {
  handleGetSupplierStores,
  handleGetStoreStocks,
  handleCreateInvoice,
  
} from "@/lib/utils/api/apiHelper";
import { getStores } from "@/actions/stores";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import { Supplier } from "@/types/supplier";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  ShoppingCart,
  Truck,
  Phone,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MyStoreType {
  id: string;
  name: string;
  stock_value: string;
  stock_count: string;
}

interface SupplierStore {
  id: string;
  name: string;
  address: {
    lat: number | null;
    lng: number | null;
    name: string;
  };
}

interface StockItem {
  id: string;
  sku: string;
  selling_price: string;
  selling_price_pieces: string;
  quantity: string;
  product: {
    name: string;
    image: string;
  };
}

interface InvoiceItem {
  stock_id: string;
  sku: string;
  product_name: string;
  quantity: number;
  mode: "PACKS" | "PIECES";
  price: number;
  total_payable: number;
}

const SUPPLIERS_PER_PAGE = 4;

const formatCurrency = (value: number): string =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Buy = () => {
  const router = useRouter();

  const [stage, setStage] = useState<
    | "select-supplier"
    | "supplier-info"
    | "supplier-store"
    | "my-store"
    | "invoice"
  >("select-supplier");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSupplier, setFilteredSupplier] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierPage, setSupplierPage] = useState(0);
  const [supplierOptionSelected, setSupplierOptionSelected] = useState<
    "suppliers" | "marketplace" | null
  >("suppliers");

  const [supplierStores, setSupplierStores] = useState<SupplierStore[]>([]);
  const [isLoadingSupplierStores, setIsLoadingSupplierStores] = useState(false);
  const [selectedSupplierStore, setSelectedSupplierStore] =
    useState<SupplierStore | null>(null);
  const [searchSupplierStore, setSearchSupplierStore] = useState("");

  const [myStores, setMyStores] = useState<MyStoreType[]>([]);
  const [filteredMyStores, setFilteredMyStores] = useState<MyStoreType[]>([]);
  const [isLoadingMyStores, setIsLoadingMyStores] = useState(true);
  const [myStoreError, setMyStoreError] = useState<string | null>(null);
  const [selectedMyStore, setSelectedMyStore] = useState<MyStoreType | null>(
    null,
  );
  const [searchMyStore, setSearchMyStore] = useState("");

  const [supplierStock, setSupplierStock] = useState<StockItem[]>([]);
  const [isLoadingSupplierStock, setIsLoadingSupplierStock] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(
    null,
  );

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  const invoiceForm = useForm({
    defaultValues: { stock_id: "", quantity: "1", mode: "PACKS", price: "" },
  });

  const fetchSuppliers = async () => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found.");
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
      setSupplierPage(0);
      return;
    }
    const filtered = suppliers.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setSupplierPage(0);
    if (filtered.length === 0) {
      toast.error("No supplier found");
      setFilteredSupplier(suppliers);
    } else {
      setFilteredSupplier(filtered);
    }
  }, [searchTerm, suppliers]);

  useEffect(() => {
    const load = async () => {
      setIsLoadingMyStores(true);
      setMyStoreError(null);
      try {
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");
        if (!token) {
          setMyStoreError("Please log in");
          return;
        }
        const result = await getStores(token);
        if (result.success && result.data) {
          const mapped = result.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            stock_count: s.stock_count,
            stock_value: s.stock_value?.toLocaleString() || "0",
          }));
          setMyStores(mapped);
          setFilteredMyStores(mapped);
        } else {
          setMyStoreError(result.error || "Failed to load stores");
        }
      } catch {
        setMyStoreError("Network error");
      } finally {
        setIsLoadingMyStores(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setFilteredMyStores(
      searchMyStore === ""
        ? myStores
        : myStores.filter((s) =>
            s.name.toLowerCase().includes(searchMyStore.toLowerCase()),
          ),
    );
  }, [searchMyStore, myStores]);

  useEffect(() => {
    if (stage === "supplier-store" && selectedSupplier) {
      const load = async () => {
        setIsLoadingSupplierStores(true);
        try {
          const result = await handleGetSupplierStores(
            parseInt(selectedSupplier.user_id, 10),
          );
          if (result.statusCode === 200) {
            setSupplierStores(result.data ?? []);
          } else {
            toast.error("Failed to load supplier stores");
          }
        } catch {
          toast.error("Network error loading supplier stores");
        } finally {
          setIsLoadingSupplierStores(false);
        }
      };
      load();
    }
  }, [stage, selectedSupplier]);

  useEffect(() => {
    if (stage === "invoice" && selectedSupplierStore) {
      const load = async () => {
        setIsLoadingSupplierStock(true);
        try {
          const result = await handleGetStoreStocks(selectedSupplierStore.id);
          if (result.statusCode === 200) {
            setSupplierStock(result.data ?? []);
          } else {
            toast.error("Failed to load supplier stock");
          }
        } catch {
          toast.error("Network error loading stock");
        } finally {
          setIsLoadingSupplierStock(false);
        }
      };
      load();
    }
  }, [stage, selectedSupplierStore]);

  useEffect(() => {
    const stockId = invoiceForm.watch("stock_id");
    const mode = invoiceForm.watch("mode");
    if (stockId) {
      const item = supplierStock.find((s) => s.id === stockId);
      if (item) {
        const price =
          mode === "PIECES" ? item.selling_price_pieces : item.selling_price;
        invoiceForm.setValue("price", price);
        setSelectedStockItem(item);
      }
    }
  }, [invoiceForm.watch("stock_id"), invoiceForm.watch("mode"), supplierStock]);

  const addItemToInvoice = () => {
    const values = invoiceForm.getValues();
    if (!values.stock_id || !values.quantity) {
      toast.error("Please select a product and enter quantity");
      return;
    }
    const qty = parseFloat(values.quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    const stockItem = supplierStock.find((s) => s.id === values.stock_id);
    if (!stockItem) return;
    const price = parseFloat(values.price || "0");
    setInvoiceItems((prev) => [
      ...prev,
      {
        stock_id: values.stock_id,
        sku: stockItem.product.name,
        product_name: stockItem.product.name,
        quantity: qty,
        mode: values.mode as "PACKS" | "PIECES",
        price,
        total_payable: price * qty,
      },
    ]);
    toast.success("Item added to invoice");
    invoiceForm.reset({
      stock_id: "",
      quantity: "1",
      mode: "PACKS",
      price: "",
    });
    setSelectedStockItem(null);
  };

  // ── Submit invoice → navigate to pay page ────────────────────────────────

  const submitPurchaseInvoice = async () => {
    if (invoiceItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    setIsSubmittingInvoice(true);
    try {
      const response = await handleCreateInvoice({
        store_id: selectedSupplierStore!.id,
        destination_store_id: selectedMyStore!.id,
        items: invoiceItems.map((item) => ({
          stock_id: item.stock_id,
          quantity: item.quantity,
          mode: item.mode,
          discounted_amount: 0,
        })),
      } as any);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const invoiceData = response.data;

        if (invoiceData?.id) {
          // Build preview — merge API data with local display data
          const previewData = {
            invoiceId: invoiceData.id,
            code: invoiceData.code,
            total: invoiceData.total,
            items_count: invoiceData.items_count,
            items: (invoiceData.items ?? []).map((item: any, index: number) => {
              const localItem = invoiceItems[index];
              return {
                id: item.id,
                stock_id: item.stock_id,
                quantity: item.quantity,
                cost: item.cost,
                sub_total: item.sub_total,
                mode: item.mode,
                sku: localItem?.sku || "N/A",
                product_name: localItem?.product_name || "Unknown Product",
                product_image: localItem
                  ? supplierStock.find((s) => s.id === localItem.stock_id)
                      ?.product?.image || ""
                  : "",
              };
            }),
          };

          localStorage.setItem(
            `buy-invoice-preview-${invoiceData.id}`,
            JSON.stringify(previewData),
          );
          toast.success("Invoice created successfully!");
          router.push(`/inventory/buy/buy-pay?invoiceId=${invoiceData.id}`);
        } else {
          toast.warning("Invoice created but no ID returned");
        }
      } else {
        toast.error(response.error || "Failed to create purchase invoice");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const totalPayable = invoiceItems.reduce(
    (sum, i) => sum + i.total_payable,
    0,
  );
  const filteredSupplierStores = searchSupplierStore
    ? supplierStores.filter((s) =>
        s.name.toLowerCase().includes(searchSupplierStore.toLowerCase()),
      )
    : supplierStores;
  const start = supplierPage * SUPPLIERS_PER_PAGE;
  const currentSuppliers = filteredSupplier.slice(
    start,
    start + SUPPLIERS_PER_PAGE,
  );
  const totalPages = Math.ceil(filteredSupplier.length / SUPPLIERS_PER_PAGE);

  // ── Stage 1: Select Supplier ──────────────────────────────────────────────

  if (stage === "select-supplier") {
    return (
      <div>
        <div className="flex justify-between items-center mb-2 md:mb-0">
          <div>
            <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
              Buy
            </h1>
            <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
              Buy stock from suppliers
            </p>
          </div>
          <button
            onClick={() => router.push("/my-purchase")}
            className="text-[#0A6DC0] font-semibold border-b border-[#0A6DC0] inline md:hidden"
          >
            My Purchases
          </button>
        </div>

        <div className="lg:hidden flex gap-2 bg-[#ECECF080] p-1 rounded-lg mt-3">
          <button
            onClick={() => setSupplierOptionSelected("suppliers")}
            className={`flex-1 py-3 rounded-lg font-dm-sans font-medium text-[13px] transition-all ${supplierOptionSelected === "suppliers" ? "bg-[#0A6DC0] text-white" : "text-[#9E9A9A]"}`}
          >
            Buy from Suppliers
          </button>
          <button
            onClick={() => router.push("/market-place")}
            className={`flex-1 rounded-lg font-dm-sans font-medium text-[13px] transition-all ${supplierOptionSelected === "marketplace" ? "bg-[#0A6DC0] text-white" : "text-[#9E9A9A]"}`}
          >
            Buy from Marketplace
          </button>
        </div>

        <div className="md:mt-8 flex flex-col lg:flex-row gap-4">
          {/* Left card */}
          <div className="hidden lg:flex flex-col justify-between py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg w-full lg:w-[35%] bg-white h-[550px]">
            <div>
              <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
                Select where to buy from
              </h1>
              <Separator
                orientation="horizontal"
                className="h-[1px] mt-3"
                style={{ background: "#E0E0E0" }}
              />
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 justify-between border border-[#0A6DC0] bg-[#0A6DC012] rounded-lg px-3 py-2">
                  <Truck size={30} className="shrink-0 text-[#0A6DC0]" />
                  <div className="flex-1">
                    <p className="text-[#0A6DC0] font-dm-sans font-semibold">
                      Buy from Suppliers
                    </p>
                    <p className="text-[#2F2F2F] text-[13px]">
                      Buy from other suppliers near you on the Vendcliq network.
                    </p>
                  </div>
                  <ChevronRight className="text-[#0A6DC0]" />
                </div>
                <div
                  onClick={() => router.push("/market-place")}
                  className="cursor-pointer hover:bg-[#0A6DC012] flex items-center gap-2 justify-between border border-[#D8D8D866] rounded-lg px-3 py-2 transition-colors"
                >
                  <ShoppingCart size={30} className="shrink-0" />
                  <div>
                    <p className="text-[#2F2F2F] font-dm-sans font-medium">
                      Buy from Marketplace
                    </p>
                    <p className="text-[#2F2F2F] text-[13px]">
                      Place an order on the marketplace and receive bids from
                      vendors around you.
                    </p>
                  </div>
                  <ChevronRight />
                </div>
              </div>
            </div>
            <div
              onClick={() => router.push("/my-purchase")}
              className="cursor-pointer bg-[#0A6DC0] font-dm-sans p-4 rounded-lg text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/buy.svg"
                  width={20}
                  height={20}
                  alt="wallet"
                  className="rotate-180"
                />
                <div>
                  <h1 className="font-bold">My Purchases</h1>
                  <p className="text-[13px]">
                    View your purchases or add new purchases
                  </p>
                </div>
              </div>
              <ChevronRight color="#fafafa" />
            </div>
          </div>

          {/* Right card */}
          <div className="py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg w-full lg:w-[70%] bg-white">
            <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
              Suppliers
            </h1>
            <p className="text-[#9E9A9A] font-dm-sans">
              Search and select a supplier to buy from
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
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
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
            ) : (
              <>
                {currentSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="mb-4 flex items-center justify-between border border-gray-200 rounded-lg py-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer"
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
                            className="w-full h-full object-cover hidden md:inline"
                          />
                        </div>
                      ) : (
                        <div className="hidden md:flex w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {supplier.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium capitalize text-[14px] md:text-[16px]">
                          {supplier.name}
                        </h3>
                        <div className="text-[13px] flex items-center gap-1 text-gray-600">
                          <MapPin size={14} className="hidden md:inline" />
                          <span className="hidden md:inline">
                            {supplier.address}
                          </span>
                          <span className="hidden md:inline">|</span>
                          <Phone size={14} />
                          <span>{supplier.phone}</span>
                        </div>
                        <p className="text-[13px] hidden md:inline text-gray-600">
                          {supplier.email}
                        </p>
                      </div>
                    </div>
                    <ChevronRight color="#9E9A9A" />
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => setSupplierPage((p) => Math.max(0, p - 1))}
                      disabled={supplierPage === 0}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-[14px] font-dm-sans font-medium text-[#2F2F2F] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <p className="text-[13px] text-[#9E9A9A] font-dm-sans">
                      {supplierPage + 1} of {totalPages}
                    </p>
                    <button
                      onClick={() =>
                        setSupplierPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={supplierPage >= totalPages - 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-[14px] font-dm-sans font-medium text-[#2F2F2F] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight size={16} color="#2F2F2F" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === "supplier-info" && selectedSupplier) {
    return (
      <div>
        <MoveLeft
          onClick={() => {
            setStage("select-supplier");
            setSelectedSupplier(null);
          }}
          className="mr-2 h-4 w-4 mb-3 cursor-pointer"
        />
        <h1 className="text-[16px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          {selectedSupplier.name}
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans mb-3">
          All info you need to know about this supplier
        </p>
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg bg-white">
          <div className="grid md:grid-cols-2 md:gap-y-5 gap-y-2 font-dm-sans text-[#2F2F2F]">
            <div className="lowercase">
              <p className="font-bold">Supplier Name</p>
              <p>{selectedSupplier.name}</p>
            </div>
            <div className="lowercase">
              <p className="font-bold">Address</p>
              <p>{selectedSupplier.address}</p>
            </div>
            <div className="lowercase">
              <p className="font-bold">Phone</p>
              <p>{selectedSupplier.phone}</p>
            </div>
            <div className="lowercase">
              <p className="font-bold">Email Address</p>
              <p>{selectedSupplier.email}</p>
            </div>
            <div className="lowercase">
              <p className="font-bold">Supplier Type</p>
              <p>{selectedSupplier.type}</p>
            </div>
            <div className="lowercase">
              <p className="font-bold">Bank</p>
              <p>{selectedSupplier.wallet.bank_name}</p>
            </div>
            <div className="lowercase">
              <p className="font-bold">Account Number</p>
              <p>{selectedSupplier.wallet.account_number}</p>
            </div>
            <div className="lowercase">
              <p className="font-bold">Account Name</p>
              <p>{selectedSupplier.wallet.account_name}</p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => setStage("supplier-store")}
            className="bg-[#0A6DC0] hover:bg-[#09599a] py-5 md:py-6 w-full mt-6"
          >
            Proceed
          </Button>
        </div>
      </div>
    );
  }

  // ── Stage 3: Select Supplier Store ───────────────────────────────────────

  if (stage === "supplier-store" && selectedSupplier) {
    return (
      <div>
        <MoveLeft
          onClick={() => setStage("supplier-info")}
          className="mr-2 h-4 w-4 mb-3 cursor-pointer"
        />
        <h1 className="text-[16px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Select Supplier Store
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans mb-3">
          Choose which store of {selectedSupplier.name} you want to buy from
        </p>
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg bg-white">
          <Separator
            orientation="horizontal"
            className="h-[1px] mb-4"
            style={{ background: "#E0E0E0" }}
          />
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Type to search stores"
              className="pl-10 bg-transparent border-2 border-[#E7EBED]"
              value={searchSupplierStore}
              onChange={(e) => setSearchSupplierStore(e.target.value)}
              disabled={isLoadingSupplierStores}
            />
          </div>
          <div className="space-y-2">
            {isLoadingSupplierStores ? (
              <div className="flex items-center gap-2 justify-center py-6">
                <p className="text-gray-500">Loading stores...</p>
                <ThreeDots
                  height="40"
                  width="40"
                  color="#0A6DC0"
                  visible={true}
                />
              </div>
            ) : filteredSupplierStores.length === 0 ? (
              <p className="text-center py-6 text-gray-500">
                No stores found for this supplier
              </p>
            ) : (
              filteredSupplierStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => {
                    setSelectedSupplierStore(store);
                    setStage("my-store");
                  }}
                  className={`flex justify-between border rounded-lg px-3 py-4 cursor-pointer transition-colors ${selectedSupplierStore?.id === store.id ? "bg-[#0A6DC012] border-[#0A6DC0]" : "bg-gray-50 hover:bg-gray-100 border-[#D8D8D866]"}`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/store.svg"
                      width={20}
                      height={20}
                      alt="store"
                    />
                    <div>
                      <p className="font-medium text-[16px] font-dm-sans text-[#2F2F2F]">
                        {store.name}
                      </p>
                      {store.address?.name && (
                        <p className="text-[13px] text-gray-500">
                          {store.address.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Stage 4: Select My (Buyer's) Store ────────────────────────────────────

  if (stage === "my-store") {
    return (
      <div>
        <MoveLeft
          onClick={() => setStage("supplier-store")}
          className="mr-2 h-4 w-4 mb-3 cursor-pointer"
        />
        <h1 className="text-[16px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Select Your Store
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans mb-3">
          Choose which of your stores you want to restock
        </p>
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg bg-white">
          <Separator
            orientation="horizontal"
            className="h-[1px] mb-4"
            style={{ background: "#E0E0E0" }}
          />
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Type to search"
              className="pl-10 bg-transparent border-2 border-[#E7EBED]"
              value={searchMyStore}
              onChange={(e) => setSearchMyStore(e.target.value)}
              disabled={isLoadingMyStores}
            />
          </div>
          <div className="space-y-2">
            {isLoadingMyStores ? (
              <div className="flex items-center gap-2 justify-center py-6">
                <p className="text-gray-500">Loading your stores...</p>
                <ThreeDots
                  height="40"
                  width="40"
                  color="#0A6DC0"
                  visible={true}
                />
              </div>
            ) : myStoreError ? (
              <div>
                <p className="text-center py-4 text-red-500">{myStoreError}</p>
                <button
                  className="bg-[#0A6DC0] hover:bg-[#085a9e] rounded-lg p-2 text-white"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : filteredMyStores.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No stores found</p>
            ) : (
              filteredMyStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => {
                    setSelectedMyStore(store);
                    setStage("invoice");
                  }}
                  className={`flex justify-between border rounded-lg px-3 py-4 cursor-pointer transition-colors ${selectedMyStore?.id === store.id ? "bg-[#0A6DC012] border-[#0A6DC0]" : "bg-gray-50 hover:bg-gray-100 border-[#D8D8D866]"}`}
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
        </div>
      </div>
    );
  }

  // ── Stage 5: Invoice ──────────────────────────────────────────────────────

  if (
    stage === "invoice" &&
    selectedSupplier &&
    selectedSupplierStore &&
    selectedMyStore
  ) {
    return (
      <div>
        <MoveLeft
          onClick={() => {
            setStage("my-store");
            setSelectedMyStore(null);
          }}
          className="mr-2 h-4 w-4 mb-3 cursor-pointer"
        />
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Create Invoice
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Kindly fill the details below to create invoice
        </p>

        <div className="py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg md:mt-8 bg-white">
          {/* Supplier summary */}
          <div className="mb-2 flex items-center justify-between font-dm-sans font-medium">
            <p className="text-[16px] text-[#000000]">Supplier</p>
            <button
              onClick={() => {
                setStage("select-supplier");
                setSelectedSupplier(null);
                setSelectedSupplierStore(null);
                setSelectedMyStore(null);
              }}
              className="text-[#0A6DC0]"
            >
              Change Supplier
            </button>
          </div>
          <div className="py-3 mb-4 px-5 flex items-center gap-2 font-dm-sans border border-[#0A6DC0] bg-[#0A6DC012] rounded-lg">
            <Truck className="w-8 h-8" />
            <div>
              <p className="text-[13px] md:text-[16px] text-[#2F2F2F] font-medium capitalize">
                {selectedSupplier.name}
              </p>
              <p className="hidden md:block text-[13px] text-[#2F2F2F]">
                {selectedSupplier.phone} • {selectedSupplier.email}
              </p>
              <p className="text-[13px] text-gray-500">
                {selectedSupplierStore.name}
              </p>
            </div>
          </div>

          {/* Destination store summary */}
          <div className="mb-2 font-dm-sans font-medium">
            <p className="text-[16px] text-[#000000]">Restocking Store</p>
          </div>
          <div className="py-3 mb-6 px-5 flex items-center gap-2 font-dm-sans border border-[#0A6DC0] bg-[#0A6DC012] rounded-lg">
            <Image src="/store.svg" alt="store" width={30} height={30} />
            <div>
              <p className="text-[#2F2F2F] font-medium">
                {selectedMyStore.name}
              </p>
              <div className="hidden md:flex items-center gap-2 text-[13px]">
                <p className="text-[#2F2F2F] font-medium">Inventory value:</p>
                <p className="text-[#9E9A9A]">₦{selectedMyStore.stock_value}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Form {...invoiceForm}>
            <form className="space-y-6 mb-2">
              <div className="grid md:grid-cols-2 gap-3 md:gap-5">
                {/* SKU — searchable Popover/Command */}
                <FormField
                  control={invoiceForm.control}
                  name="stock_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (from Supplier)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-12 bg-[#F9F9F9] border border-[#D8D8D866]"
                            disabled={
                              isLoadingSupplierStock ||
                              supplierStock.length === 0
                            }
                          >
                            {field.value ? (
                              (() => {
                                const selected = supplierStock.find(
                                  (s) => s.id === field.value,
                                );
                                return selected ? (
                                  <div className="flex items-center gap-3 truncate">
                                    {selected.product?.image && (
                                      <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                                        <Image
                                          src={selected.product.image}
                                          alt={selected.sku}
                                          width={32}
                                          height={32}
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                    )}
                                    <div className="flex items-start flex-col truncate">
                                      <span className="font-medium">
                                        {selected.sku}
                                      </span>
                                      <span className="text-xs text-gray-500 truncate">
                                        {selected.product?.name}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  "Select product..."
                                );
                              })()
                            ) : isLoadingSupplierStock ? (
                              <span className="text-gray-400">
                                Loading stock...
                              </span>
                            ) : supplierStock.length === 0 ? (
                              <span className="text-gray-400">
                                No stock available
                              </span>
                            ) : (
                              "Select product / SKU..."
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-full p-0 max-h-[320px]"
                          align="start"
                        >
                          <Command>
                            <CommandInput
                              placeholder="Search by SKU or product name..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {isLoadingSupplierStock ? (
                                  <ClipLoader size={24} color="#0A6DC0" />
                                ) : (
                                  "No product found."
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {supplierStock.map((stock) => (
                                  <CommandItem
                                    key={stock.id}
                                    value={`${stock.sku} ${stock.product.name}`.toLowerCase()}
                                    onSelect={() => {
                                      field.onChange(stock.id);
                                      document.dispatchEvent(
                                        new KeyboardEvent("keydown", {
                                          key: "Escape",
                                        }),
                                      );
                                    }}
                                    className="cursor-pointer py-3 px-4 hover:bg-gray-50"
                                  >
                                    <div className="flex items-center justify-between w-full gap-4">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {stock.product?.image ? (
                                          <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                            <Image
                                              src={stock.product.image}
                                              alt={stock.sku}
                                              width={40}
                                              height={40}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                                            No img
                                          </div>
                                        )}
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-medium text-sm">
                                            {stock.sku}
                                          </span>
                                          <span className="text-xs text-gray-500 truncate">
                                            {stock.product?.name}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            ₦ {stock.selling_price}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right whitespace-nowrap">
                                        <span className="text-sm font-medium text-[#0A6DC0]">
                                          {stock.quantity}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-1">
                                          left
                                        </span>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sales Mode */}
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
                        <div className="flex gap-6 pt-2">
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

                {/* Quantity */}
                <FormField
                  control={invoiceForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 1"
                          {...field}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "" || /^\d*\.?\d*$/.test(v))
                              field.onChange(v);
                          }}
                          className="bg-[#F9F9F9] h-12 border border-[#D8D8D866]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price — auto-filled, read-only */}
                <div className="space-y-2">
                  <Label>Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500">
                      ₦
                    </span>
                    <Input
                      value={invoiceForm.watch("price")}
                      readOnly
                      className="bg-[#F9F9F9] h-12 border border-[#D8D8D866] pl-8 cursor-not-allowed"
                    />
                  </div>
                </div>
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
        </div>

        {/* Invoice table */}
        <Card className="md:mt-5 md:px-4 pb-6">
          {invoiceItems.length > 0 && (
            <div className="md:mt-8">
              <h3 className="font-semibold mb-4">
                Invoice Items ({invoiceItems.length})
              </h3>
              <div className="overflow-x-auto mt-6 border-[#E4E4E4] border-2 bg-white rounded-2xl">
                <table className="w-full my-6">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-4 py-3 font-medium font-dm-sans text-[13px] text-[#2F2F2F]">
                        SKU
                      </th>
                      <th className="text-left py-3 font-medium font-dm-sans text-[13px] text-[#2F2F2F]">
                        Qty
                      </th>
                      <th className="text-left py-3 font-medium font-dm-sans text-[13px] text-[#2F2F2F]">
                        Mode
                      </th>
                      <th className="text-left py-3 font-medium font-dm-sans text-[13px] text-[#2F2F2F]">
                        Price
                      </th>
                      <th className="text-left py-3 font-medium font-dm-sans text-[13px] text-[#2F2F2F]">
                        Total Payable
                      </th>
                      <th className="text-left py-3 font-medium font-dm-sans text-[13px] text-[#2F2F2F]">
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
                        <td className="lowercase text-left p-4 py-4 font-dm-sans text-[13px] text-[#2F2F2F]">
                          {item.sku}
                        </td>
                        <td className="py-4 text-[13px] text-[#2F2F2F]">
                          {item.quantity}
                        </td>
                        <td className="py-4 lowercase text-[13px] text-[#2F2F2F]">
                          {item.mode}
                        </td>
                        <td className="py-4 text-[13px] text-[#2F2F2F]">
                          ₦{formatCurrency(item.price)}
                        </td>
                        <td className="py-4 font-semibold text-[#0A6DC0] text-[13px]">
                          ₦{formatCurrency(item.total_payable)}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => {
                              setInvoiceItems((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              );
                              toast.success("Item removed");
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

                <div className="px-4 pb-4 flex justify-end">
                  <div className="bg-[#0A6DC012] rounded-lg p-4 min-w-[250px]">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[16px] text-[#2F2F2F]">
                        Total Payable:
                      </span>
                      <span className="font-bold text-[20px] text-[#0A6DC0]">
                        ₦{formatCurrency(totalPayable)}
                      </span>
                    </div>
                  </div>
                </div>
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
              "Proceed to Payment"
            )}
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};

export default Buy;
