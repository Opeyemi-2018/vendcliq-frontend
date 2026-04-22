/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  X,
  Search,
  Check,
  Minus,
  Plus,
  User,
  Package,
  ExternalLink,
  MapPin,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { ThreeDots } from "react-loader-spinner";
import { getStores } from "@/actions/stores";
import { getCustomers } from "@/actions/getcustomers";
import { getStoreStock } from "@/actions/getUserStocks";
import {
  getSaleById,
  handleUpdateInvoice,
  handleCreateCustomer,
} from "@/lib/utils/api/apiHelper";
import PlacesAutocompleteInput from "@/hooks/googleMap";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Store {
  id: string;
  name: string;
  address: { lat: number; lng: number; name: string };
  phone: string;
  credit_store: boolean;
  attributes: any | null;
  meta: any | null;
  createdAt: string;
  updatedAt: string;
  stock_value: number;
  stock_count: number;
  low_stock_count: number;
}

interface StockItem {
  id: string;
  sku: string;
  cost_price: string;
  selling_price: string;
  selling_price_pieces: string;
  empties_price: string;
  quantity: string;
  empties_qty: string;
  total_qty: string;
  status: string;
  product: {
    id: string;
    name: string;
    items_per_pack: number;
    image: string | null;
  };
  store: { id: string; name: string };
  qty_sold?: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type?: string;
}

type SellMode = "PACKS" | "PIECES";

interface CartItem {
  stock: StockItem;
  quantity: number;
  mode: SellMode;
  discount: number;
  empties: number;
  emptiesMode: "SELL" | "CREDIT" | null;
  packsQuantity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });

const unitPrice = (item: StockItem, mode: SellMode) =>
  mode === "PACKS"
    ? parseFloat(item.selling_price)
    : parseFloat(item.selling_price_pieces);

const itemSubtotal = (ci: CartItem) => {
  const base = unitPrice(ci.stock, ci.mode);
  const discounted = Math.max(0, base - ci.discount);
  const productTotal = discounted * ci.quantity;
  const emptiesTotal =
    ci.empties > 0 ? parseFloat(ci.stock.empties_price) * ci.empties : 0;
  return productTotal + emptiesTotal;
};

const imgSrc = (src: string | null) => {
  if (!src) return null;
  return src.startsWith("//") ? `https:${src}` : src;
};

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  // Store
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storesLoading, setStoresLoading] = useState(true);
  const [changeStoreOpen, setChangeStoreOpen] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [pendingStore, setPendingStore] = useState<Store | null>(null);

  // Stock
  const [stock, setStock] = useState<StockItem[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockSearch, setStockSearch] = useState("");

  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true);
  const [activeStockId, setActiveStockId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<SellMode>("PACKS");
  const [activeQty, setActiveQty] = useState<string>("1");
  const [activeDiscount, setActiveDiscount] = useState<string>("");
  const [activeEmpties, setActiveEmpties] = useState<string>("");
  const [activeEmptiesMode, setActiveEmptiesMode] = useState<"SELL" | "CREDIT">(
    "SELL",
  );
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showEmptiesInput, setShowEmptiesInput] = useState(false);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [tempDiscount, setTempDiscount] = useState<string>("");

  const [emptiesModalOpen, setEmptiesModalOpen] = useState(false);
  const [tempEmpties, setTempEmpties] = useState<string>("");
  const [tempEmptiesMode, setTempEmptiesMode] = useState<"SELL" | "CREDIT">(
    "SELL",
  );
  const [itemDisplayModes, setItemDisplayModes] = useState<
    Record<string, "PACKS" | "PIECES">
  >({});

  const [mobileView, setMobileView] = useState<"items" | "cart">("items");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer
  const [customerMode, setCustomerMode] = useState<"walkin" | "registered">(
    "walkin",
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectCustomerOpen, setSelectCustomerOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [pendingCustomer, setPendingCustomer] = useState<Customer | null>(null);

  const [updatingInvoice, setUpdatingInvoice] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
    address: "",
  });

  // Fetch stores
  const fetchStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return toast.error("Please log in");
      const result = await getStores(token);
      if (result.success && result.data) {
        const valid: Store[] = (result.data as Store[]).filter(
          (s) => !s.credit_store,
        );
        setStores(valid);
      } else {
        toast.error(result.error || "Failed to load stores");
      }
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setStoresLoading(false);
    }
  }, []);

  const fetchInvoice = useCallback(async () => {
    // Don't run if stores are still loading or empty
    if (storesLoading || stores.length === 0) {
      return;
    }

    setIsLoadingInvoice(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const result = await getSaleById(invoiceId);
      if (result.statusCode === 200 && result.data) {
        const invoice = result.data;

        // Add a null check for invoice.store
        const invoiceStore = invoice.store;

        if (invoiceStore) {
          // Find the store from the stores list (which should already be loaded)
          const storeFromList = stores.find((s) => s.id === invoiceStore.id);

          if (storeFromList) {
            // Replace the store creation in the if (storeFromList) block:
            const store: Store = {
              id: storeFromList.id,
              name: storeFromList.name,
              address: storeFromList.address || { lat: 0, lng: 0, name: "" },
              phone: storeFromList.phone,
              credit_store: storeFromList.credit_store || false,
              attributes: storeFromList.attributes || null,
              meta: storeFromList.meta || null,
              createdAt: storeFromList.createdAt,
              updatedAt: storeFromList.updatedAt,
              stock_value: storeFromList.stock_value || 0,
              stock_count: storeFromList.stock_count || 0,
              low_stock_count: storeFromList.low_stock_count || 0,
            };
            setSelectedStore(store);

            // Fetch stock for this store
            const stockResult = await getStoreStock(token, store.id);
            if (stockResult.success && stockResult.data) {
              const stockData = stockResult.data as StockItem[];
              setStock(stockData);

              // Map invoice items to cart items
              const cartItems: CartItem[] = invoice.items.map((item: any) => {
                // Create a StockItem from the nested stock data
                const stockItem: StockItem = {
                  id: item.stock.id,
                  sku: item.stock.sku,
                  cost_price: "0",
                  selling_price: item.cost.toString(),
                  selling_price_pieces: (
                    item.cost / (item.product?.items_per_pack || 1)
                  ).toString(),
                  empties_price: "0",
                  quantity: item.stock.qty.toString(),
                  empties_qty: "0",
                  total_qty: item.stock.qty.toString(),
                  status: "in_stock",
                  product: {
                    id: item.product.id,
                    name: item.product.name,
                    items_per_pack: item.product?.items_per_pack || 1,
                    image: item.product.image || null,
                  },
                  store: { id: invoiceStore.id, name: invoiceStore.name },
                  qty_sold: 0,
                };

                return {
                  stock: stockItem,
                  quantity: item.quantity,
                  mode: item.mode as SellMode,
                  discount: item.discounted_amount || 0,
                  empties: item.empties?.quantity || 0,
                  emptiesMode: item.empties?.type || null,
                  packsQuantity: item.quantity,
                };
              });

              setCart(cartItems);
            }
          } else {
            // Fallback: create store from invoice data without stock values
            // Replace the store creation in the else block:
            const store: Store = {
              id: invoiceStore.id,
              name: invoiceStore.name,
              address: invoiceStore.address || { lat: 0, lng: 0, name: "" },
              phone: invoiceStore.phone,
              credit_store: invoiceStore.credit_store || false,
              attributes: invoiceStore.attributes || null,
              meta: invoiceStore.meta || null,
              createdAt: invoiceStore.createdAt || new Date().toISOString(),
              updatedAt: invoiceStore.updatedAt || new Date().toISOString(),
              stock_value: 0,
              stock_count: 0,
              low_stock_count: 0,
            };
            setSelectedStore(store);

            // Still fetch stock for this store
            const stockResult = await getStoreStock(token, store.id);
            if (stockResult.success && stockResult.data) {
              const stockData = stockResult.data as StockItem[];
              setStock(stockData);

              // Map items similarly...
              const cartItems: CartItem[] = invoice.items.map((item: any) => {
                const stockItem: StockItem = {
                  id: item.stock.id,
                  sku: item.stock.sku,
                  cost_price: "0",
                  selling_price: item.cost.toString(),
                  selling_price_pieces: (
                    item.cost / (item.product?.items_per_pack || 1)
                  ).toString(),
                  empties_price: "0",
                  quantity: item.stock.qty.toString(),
                  empties_qty: "0",
                  total_qty: item.stock.qty.toString(),
                  status: "in_stock",
                  product: {
                    id: item.product.id,
                    name: item.product.name,
                    items_per_pack: item.product?.items_per_pack || 1,
                    image: item.product.image || null,
                  },
                  store: { id: invoiceStore.id, name: invoiceStore.name },
                  qty_sold: 0,
                };

                return {
                  stock: stockItem,
                  quantity: item.quantity,
                  mode: item.mode as SellMode,
                  discount: item.discounted_amount || 0,
                  empties: item.empties?.quantity || 0,
                  emptiesMode: item.empties?.type || null,
                  packsQuantity: item.quantity,
                };
              });
              setCart(cartItems);
            }
          }
        }

        // Set customer
        if (invoice.customer) {
          setCustomerMode("registered");
          setSelectedCustomer({
            id: invoice.customer.id,
            name: invoice.customer.name,
            email: invoice.customer.email || "",
            phone: invoice.customer.phone,
            type: invoice.customer.type,
          });
        } else {
          setCustomerMode("walkin");
        }
      } else {
        toast.error(result.error || "Failed to load invoice");
      }
    } catch (error) {
      console.error("Fetch invoice error:", error);
      toast.error("Failed to load invoice");
    } finally {
      setIsLoadingInvoice(false);
    }
  }, [invoiceId, stores, storesLoading]);

  // Update the useEffect that triggers fetchInvoice
  useEffect(() => {
    if (!storesLoading && stores.length > 0) {
      fetchInvoice();
    }
  }, [storesLoading, stores.length, fetchInvoice]);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (stores.length > 0 && !storesLoading) {
      fetchInvoice();
    }
  }, [stores, storesLoading, fetchInvoice]);

  // Fetch stock when store changes (for adding new items)
  const fetchStock = useCallback(async (storeId: string) => {
    setStockLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const result = await getStoreStock(token, storeId);
      if (result.success && result.data) {
        setStock(result.data as StockItem[]);
      } else {
        setStock([]);
        toast.error("Failed to load store stock");
      }
    } catch {
      toast.error("Network error loading stock");
    } finally {
      setStockLoading(false);
    }
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const result = await getCustomers(token);
      if (result.success && result.data) {
        setCustomers(result.data as Customer[]);
      } else {
        toast.error("Failed to load customers");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectCustomerOpen) fetchCustomers();
  }, [selectCustomerOpen]);

  const openItem = (item: StockItem) => {
    setActiveStockId(item.id);
    setActiveMode("PACKS");
    setActiveQty("1");
    setActiveDiscount("");
    setActiveEmpties("");
    setActiveEmptiesMode("SELL");
    setShowDiscountInput(false);
    setShowEmptiesInput(false);
    setItemDisplayModes((prev) => ({ ...prev, [item.id]: "PACKS" }));
  };

  const activeItem = stock.find((s) => s.id === activeStockId) ?? null;
  const activePrice = activeItem ? unitPrice(activeItem, activeMode) : 0;

  const previewSubtotal = (() => {
    if (!activeItem) return 0;
    const qty = parseFloat(activeQty) || 0;
    const disc = parseFloat(activeDiscount) || 0;
    const empties = parseFloat(activeEmpties) || 0;
    const discountedProductPrice = Math.max(0, activePrice - disc);
    const productTotal = discountedProductPrice * qty;
    const emptiesPrice = parseFloat(activeItem.empties_price) || 0;
    const emptiesTotal =
      showEmptiesInput && empties > 0 ? emptiesPrice * empties : 0;
    return productTotal + emptiesTotal;
  })();

  const handleAddToCart = () => {
    if (!activeItem) return;
    const qty = parseFloat(activeQty);
    if (!qty || qty <= 0) return toast.error("Enter a valid quantity");

    if (activeMode === "PIECES" && !Number.isInteger(qty)) {
      return toast.error(
        "Pieces quantity cannot be decimal. Please enter a whole number.",
      );
    }

    const availablePacks = parseFloat(activeItem.quantity);
    const availablePieces = availablePacks * activeItem.product.items_per_pack;

    if (activeMode === "PACKS" && qty > availablePacks) {
      return toast.error(`Only ${availablePacks} packs available`);
    }
    if (activeMode === "PIECES" && qty > availablePieces) {
      return toast.error(`Only ${availablePieces} pieces available`);
    }

    const empties = showEmptiesInput ? parseFloat(activeEmpties) || 0 : 0;
    const discount = showDiscountInput ? parseFloat(activeDiscount) || 0 : 0;
    const availableEmpties = parseFloat(activeItem.empties_qty);

    if (empties > availableEmpties) {
      return toast.error(`Only ${availableEmpties} empties available`);
    }

    const packsQuantity =
      activeMode === "PACKS" ? qty : qty / activeItem.product.items_per_pack;
    const existingIndex = cart.findIndex(
      (c) => c.stock.id === activeItem.id && c.mode === activeMode,
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + qty,
        packsQuantity: updated[existingIndex].packsQuantity + packsQuantity,
        discount,
        empties: updated[existingIndex].empties + empties,
        emptiesMode:
          empties > 0 ? activeEmptiesMode : updated[existingIndex].emptiesMode,
      };
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          stock: activeItem,
          quantity: qty,
          mode: activeMode,
          discount,
          empties,
          emptiesMode: empties > 0 ? activeEmptiesMode : null,
          packsQuantity,
        },
      ]);
    }
    setActiveStockId(null);
    setActiveQty("1");
    setActiveDiscount("");
    setActiveEmpties("");
    setShowDiscountInput(false);
    setShowEmptiesInput(false);
    toast.success(`${activeItem.product.name} added to cart`);
  };

  const removeCartItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Item removed");
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart((prev) =>
      prev.map((ci, i) => {
        if (i === idx) {
          const availablePacks = parseFloat(ci.stock.quantity);
          let newQuantity = ci.quantity;
          let newPacksQuantity = ci.packsQuantity;

          if (ci.mode === "PACKS") {
            newQuantity = Math.max(0.5, ci.quantity + delta);
            newPacksQuantity = newQuantity;
            if (newPacksQuantity > availablePacks) {
              toast.error(`Only ${availablePacks} packs available`);
              return ci;
            }
          } else {
            const availablePieces =
              availablePacks * ci.stock.product.items_per_pack;
            const newPieces = Math.max(
              ci.stock.product.items_per_pack,
              ci.quantity + delta,
            );
            if (newPieces > availablePieces) {
              toast.error(`Only ${availablePieces} pieces available`);
              return ci;
            }
            newQuantity = newPieces;
            newPacksQuantity = newPieces / ci.stock.product.items_per_pack;
          }
          return {
            ...ci,
            quantity: newQuantity,
            packsQuantity: newPacksQuantity,
          };
        }
        return ci;
      }),
    );
  };

  const totalAmount = cart.reduce((s, ci) => s + itemSubtotal(ci), 0);
  const totalDiscount = cart.reduce(
    (s, ci) => s + ci.discount * ci.quantity,
    0,
  );
  const totalEmpties = cart.reduce((s, ci) => s + ci.empties, 0);

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim())
      return toast.error("Name and phone are required");

    setAddingCustomer(true);
    try {
      const response = await handleCreateCustomer({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        email: newCustomer.email.trim(),
        type: (newCustomer.type || "Retailer") as
          | "Distributor"
          | "Wholesaler"
          | "Retailer",
        address: { address: newCustomer.address, latitude: 0, longitude: 0 },
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        setSelectedCustomer(response.data);
        setCustomerMode("registered");
        setAddCustomerOpen(false);
        setSelectCustomerOpen(false);
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          type: "",
          address: "",
        });
        toast.success("Customer created successfully");
        fetchCustomers();
      } else {
        toast.error(response.error || "Failed to create customer");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setAddingCustomer(false);
    }
  };
  const handleUpdateInvoiceSubmit = async () => {
    if (!selectedStore) return toast.error("Select a store first");
    if (cart.length === 0) return toast.error("Add at least one item");

    setUpdatingInvoice(true);
    try {
      const storeAddress = selectedStore.address || null;

      const payload = {
        customer_id:
          customerMode === "registered" ? selectedCustomer?.id || null : null,
        store_id: selectedStore.id,
        items: cart.map((ci) => ({
          stock_id: ci.stock.id, 
          quantity: ci.quantity,
          delivery: false,
          mode: ci.mode,
          discounted_amount: ci.discount,
          empties:
            ci.empties > 0 && ci.emptiesMode !== null
              ? { type: ci.emptiesMode, quantity: ci.empties }
              : undefined,
          attributes: {
            latitude: storeAddress?.lat || 0,
            longitude: storeAddress?.lng || 0,
            address: storeAddress?.name || "",
          },
        })),
      };

      console.log("Update payload:", JSON.stringify(payload, null, 2));

      const response = await handleUpdateInvoice(invoiceId, payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Invoice updated successfully!");
        router.push(`/inventory/sales/${invoiceId}`);
      } else {
        toast.error(response.error || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update invoice");
    } finally {
      setUpdatingInvoice(false);
    }
  };

  const filteredStock = stock.filter(
    (s) =>
      s.product.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
      s.sku.toLowerCase().includes(stockSearch.toLowerCase()),
  );

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(storeSearch.toLowerCase()),
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch),
  );

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2F2F2F] font-clash">
          Edit Invoice
        </h1>
        <p className="text-[#9E9A9A] text-sm font-medium">
          Update the invoice items and details
        </p>
      </div>

      <div className="flex lg:hidden mb-4 rounded-xl border border-[#E4E4E4] overflow-hidden">
        <button
          onClick={() => setMobileView("items")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
            mobileView === "items"
              ? "bg-[#0A6DC0] hover:bg-[#09599a] text-white"
              : "bg-white text-[#9E9A9A]"
          }`}
        >
          See Items
        </button>
        <button
          onClick={() => setMobileView("cart")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all relative ${
            mobileView === "cart"
              ? "bg-[#0A6DC0] hover:bg-[#09599a] text-white"
              : "bg-white text-[#9E9A9A]"
          }`}
        >
          Cart Details
          {cart.length > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full inline-flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <div className="pb-10 flex gap-6">
        {/* LEFT PANEL */}
        <div
          className={`w-full lg:w-[60%] space-y-3 bg-white rounded-2xl md:border border-[#E6E6E6] md:p-5 ${
            mobileView === "cart" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#2F2F2F]">Store</p>
            <button
              onClick={() => {
                setPendingStore(selectedStore);
                setChangeStoreOpen(true);
              }}
              className="text-[#0A6DC0] text-sm font-semibold hover:underline"
            >
              Change Store
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-[#E6E6E6] py-2 px-4">
            {storesLoading || isLoadingInvoice ? (
              <div className="flex items-center justify-center py-4">
                <ThreeDots height="40" width="40" color="#0A6DC0" visible />
                <p className="text-sm text-[#9E9A9A] ml-2">
                  {storesLoading ? "Loading Stores..." : "Loading Invoice..."}
                </p>
              </div>
            ) : selectedStore ? (
              <div className="flex items-center gap-3">
                <Image src="/store.svg" width={20} height={20} alt="store" />
                <div>
                  <p className="font-medium text-[#2F2F2F]">
                    {selectedStore.name}
                  </p>
                  <div className="text-[13px] text-[#2F2F2F] flex items-center gap-2">
                    <p>Inventory value: </p>
                    <span className="text-[#9E9A9A]">
                      {selectedStore.stock_value?.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[13px] text-[#2F2F2F] flex items-center gap-2">
                    <p>Product Count:</p>
                    <span className="text-[#9E9A9A]">
                      {selectedStore.stock_count}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No store selected</p>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A9A] w-4 h-4" />
            <Input
              placeholder="Search SKU"
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="pl-9 bg-[#D8D8D866] border-[#F9F9F9] rounded-xl h-12"
            />
          </div>

          {stockLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ThreeDots height="50" width="50" color="#0A6DC0" visible />
              <p className="text-sm text-[#9E9A9A]">Loading products...</p>
            </div>
          ) : filteredStock.length === 0 ? (
            <div className="text-center py-16 text-[#9E9A9A] text-sm">
              No products found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStock.map((item) => {
                const isActive = activeStockId === item.id;
                const inCart = cart.some((c) => c.stock.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isActive
                        ? "border-[#0A6DC0] shadow-md"
                        : "border-[#E4E4E4]"
                    }`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() =>
                        isActive ? setActiveStockId(null) : openItem(item)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg border border-[#E4E4E4] overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
                          {imgSrc(item.product.image) ? (
                            <Image
                              src={imgSrc(item.product.image)!}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[12px] md:text-[16px] text-[#2F2F2F] leading-tight">
                            {item.product.name}
                            {inCart && (
                              <span className="ml-2 text-xs text-white bg-[#0A6DC0] hover:bg-[#09599a] px-1.5 py-0.5 rounded-full">
                                In cart
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#9E9A9A] text-[8px] md:text-[13px]">
                            SKU: {item.sku}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs">
                          {item.status === "in_stock" ? (
                            <span className="text-[#9E9A9A] font-medium">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium">
                              Out of Stock
                            </span>
                          )}
                        </p>
                        <p className="font-bold text-[12px] md:text-[16px] text-[#2F2F2F]">
                          {(itemDisplayModes[item.id] || "PACKS") === "PACKS"
                            ? `${parseFloat(item.quantity).toFixed(0)} packs`
                            : `${(parseFloat(item.quantity) * item.product.items_per_pack).toFixed(0)} pieces`}
                        </p>
                        <p className="text-[10px] text-[#2F2F2F] mt-0.5">
                          1 pack = {item.product.items_per_pack} pieces
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <div className="px-4 pb-4 space-y-4">
                        <p className="text-[#2F2F2F] text-[12px] md:text-[16px] font-bold">
                          {fmt(activePrice)}
                          <span className="text-xs text-[#9E9A9A] font-normal">
                            /{activeMode === "PACKS" ? "pack" : "piece"}
                          </span>
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {(["PACKS", "PIECES"] as SellMode[]).map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                setActiveMode(m);
                                setItemDisplayModes((prev) => ({
                                  ...prev,
                                  [item.id]: m,
                                }));
                              }}
                              className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                                activeMode === m
                                  ? "bg-[#0A6DC00D] border-[#0A6DC0] text-[#0A6DC0]"
                                  : "bg-[#F5F6FA] border-transparent text-[#9E9A9A]"
                              }`}
                            >
                              {m === "PACKS"
                                ? "Packs/Crates"
                                : "Pieces/Bottles"}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setActiveQty((v) =>
                                String(
                                  Math.max(
                                    0.5,
                                    parseFloat(v) -
                                      (activeMode === "PACKS" ? 0.5 : 1),
                                  ),
                                ),
                              )
                            }
                            className="w-16 h-10 rounded-lg border border-[#E4E4E4] flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <Input
                            type="number"
                            value={activeQty}
                            onChange={(e) => setActiveQty(e.target.value)}
                            className="w-full bg-white text-center font-semibold border-[#D8D8D866]"
                            min={activeMode === "PACKS" ? 0.5 : 1}
                            step={activeMode === "PACKS" ? 0.5 : 1}
                          />
                          <button
                            onClick={() =>
                              setActiveQty((v) =>
                                String(
                                  parseFloat(v) +
                                    (activeMode === "PACKS" ? 0.5 : 1),
                                ),
                              )
                            }
                            className="w-16 h-10 rounded-lg border border-[#E4E4E4] flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setTempDiscount(activeDiscount);
                              setDiscountModalOpen(true);
                            }}
                            className="py-2 px-3 rounded-xl text-sm font-medium border bg-[#F9F9F9] border-[#D8D8D866]"
                          >
                            Add Discount
                          </button>
                          <button
                            onClick={() => {
                              setTempEmpties(activeEmpties);
                              setTempEmptiesMode(activeEmptiesMode);
                              setEmptiesModalOpen(true);
                            }}
                            className="py-2 px-3 rounded-xl text-sm font-medium border bg-[#F9F9F9] border-[#D8D8D866]"
                          >
                            Sell with Empties
                          </button>
                        </div>

                        {activeDiscount && parseFloat(activeDiscount) > 0 && (
                          <div className="flex items-center justify-between bg-[#FFF8EC] p-2 rounded-lg">
                            <span className="text-sm text-[#E89500]">
                              Discount: {fmt(parseFloat(activeDiscount))}
                            </span>
                            <button onClick={() => setActiveDiscount("")}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {activeEmpties && parseFloat(activeEmpties) > 0 && (
                          <div className="flex items-center justify-between bg-[#EEF5FB] p-2 rounded-lg">
                            <span className="text-sm text-[#0A6DC0]">
                              {activeEmpties} empties (
                              {activeEmptiesMode === "CREDIT"
                                ? "Credit"
                                : "Sold"}
                              )
                            </span>
                            <button
                              onClick={() => {
                                setActiveEmpties("");
                                setActiveEmptiesMode("SELL");
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between py-2 border-t border-[#F0F0F0]">
                          <span className="text-sm text-[#9E9A9A]">
                            Subtotal
                          </span>
                          <span className="font-bold text-[#2F2F2F]">
                            {fmt(previewSubtotal)}
                          </span>
                        </div>

                        <Button
                          onClick={handleAddToCart}
                          className="w-full bg-[#0A6DC0] hover:bg-[#09599a] hover:bg-[#09599a] rounded-xl h-11"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div
          className={`w-full lg:w-[40%] space-y-4 ${mobileView === "items" ? "hidden lg:block" : "block"}`}
        >
          <div className="bg-white rounded-2xl md:border border-[#E4E4E4] md:p-6 sticky top-6">
            <p className="font-bold text-[#2F2F2F] text-lg mb-4">
              Invoice Details
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  setCustomerMode("walkin");
                  setSelectedCustomer(null);
                }}
                className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                  customerMode === "walkin"
                    ? "border-[#0A6DC0] text-[#0A6DC0] bg-[#EEF5FB]"
                    : "border-[#E4E4E4] text-[#9E9A9A]"
                }`}
              >
                Walk-In
              </button>
              <button
                onClick={() => {
                  setCustomerMode("registered");
                  setSelectCustomerOpen(true);
                }}
                className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                  customerMode === "registered"
                    ? "border-[#0A6DC0] text-[#0A6DC0] bg-[#EEF5FB]"
                    : "border-[#E4E4E4] text-[#9E9A9A]"
                }`}
              >
                Registered
              </button>
            </div>

            {selectedCustomer && (
              <div className="mb-3 p-3 rounded-xl border border-[#E4E4E4] bg-[#F9F9F9] flex items-center gap-2">
                <User className="w-6 h-6" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-[13px]">{selectedCustomer.phone}</p>
                </div>
                <button
                  onClick={() => setSelectCustomerOpen(true)}
                  className="text-[#9E9A9A] hover:text-[#0A6DC0]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="border-t border-[#F0F0F0] my-3" />

            {cart.length === 0 ? (
              <p className="text-center text-sm text-[#9E9A9A] py-6">
                No items added yet
              </p>
            ) : (
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                {cart.map((ci, idx) => (
                  <div
                    key={idx}
                    className="space-y-1 bg-white border border-[#D8D8D866] p-3 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {ci.stock.product.name}
                        </p>
                        <p className="text-xs text-[#9E9A9A]">
                          SKU: {ci.stock.sku}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between shrink-0">
                          <p className="font-bold text-sm">
                            {fmt(unitPrice(ci.stock, ci.mode))}
                          </p>
                          <button
                            onClick={() => removeCartItem(idx)}
                            className="text-red-500 ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#9E9A9A]">
                          Price per {ci.mode.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-[13px]">
                        Quantity ({ci.mode === "PACKS" ? "packs" : "pieces"})
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQty(idx, ci.mode === "PACKS" ? -0.5 : -1)
                          }
                          className="w-7 h-7 rounded-md border border-[#E4E4E4] flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-12 text-center">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQty(idx, ci.mode === "PACKS" ? 0.5 : 1)
                          }
                          className="w-7 h-7 rounded-md border border-[#E4E4E4] flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {ci.discount > 0 && (
                      <p className="text-xs text-[#E89500]">
                        {fmt(ci.discount)} Discount Added
                      </p>
                    )}
                    {ci.empties > 0 && (
                      <p className="text-xs text-[#0A6DC0]">
                        {ci.empties} Empties (
                        {ci.emptiesMode === "CREDIT" ? "On Credit" : "Sold"})
                      </p>
                    )}
                    <div className="border-t border-[#D8D8D866] pt-2"></div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#9E9A9A]">Subtotal</span>
                      <span className="font-bold">{fmt(itemSubtotal(ci))}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9E9A9A]">Total Items</span>
                  <span className="font-medium">{cart.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9A9A]">Total Amount</span>
                  <span className="font-medium">{fmt(totalAmount)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#9E9A9A]">Total Discount</span>
                    <span className="font-medium text-[#E89500]">
                      {fmt(totalDiscount)}
                    </span>
                  </div>
                )}
                {totalEmpties > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#9E9A9A]">Empties Owed</span>
                    <span className="font-medium">{totalEmpties}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-[#F0F0F0]">
                  <span>Amount Payable</span>
                  <span>{fmt(totalAmount)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpdateInvoiceSubmit}
              disabled={updatingInvoice || cart.length === 0}
              className="w-full mt-4 bg-[#0A6DC0] hover:bg-[#09599a] rounded-xl h-12 font-semibold"
            >
              {updatingInvoice ? "Updating..." : "Update Invoice"}
            </Button>
          </div>
        </div>
      </div>

      {/* Change Store Modal */}
      {changeStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-bold">Change Store</p>
              <button onClick={() => setChangeStoreOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                <Input
                  placeholder="Search"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredStores.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setPendingStore(s)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${pendingStore?.id === s.id ? "border-[#0A6DC0] bg-[#EEF5FB]" : "border-[#E4E4E4]"}`}
                  >
                    <Image
                      src="/store.svg"
                      width={20}
                      height={20}
                      alt="store"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-[#9E9A9A]">
                        Inventory value: {s.stock_value?.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pendingStore?.id === s.id ? "border-[#0A6DC0] bg-[#0A6DC0] hover:bg-[#09599a]" : "border-gray-300"}`}
                    >
                      {pendingStore?.id === s.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <Button
                onClick={() => {
                  if (pendingStore) {
                    setSelectedStore(pendingStore);
                    setCart([]);
                    fetchStock(pendingStore.id);
                  }
                  setChangeStoreOpen(false);
                }}
                disabled={!pendingStore}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
              >
                Select Store
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Select Customer Modal */}
      {selectCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-bold">Select Customer</p>
              <button onClick={() => setSelectCustomerOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                <Input
                  placeholder="Search"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <button
                onClick={() => {
                  setSelectCustomerOpen(false);
                  setAddCustomerOpen(true);
                }}
                className="text-[#0A6DC0] text-sm font-semibold"
              >
                + Add New Customer
              </button>
              {customersLoading ? (
                <div className="flex justify-center py-8">
                  <ThreeDots height="40" width="40" color="#0A6DC0" />
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setPendingCustomer(c)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${pendingCustomer?.id === c.id ? "border-[#0A6DC0] bg-[#EEF5FB]" : "border-[#E4E4E4]"}`}
                    >
                      <User className="w-4 h-4" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-[#9E9A9A]">{c.phone}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pendingCustomer?.id === c.id ? "border-[#0A6DC0] bg-[#0A6DC0] hover:bg-[#09599a]" : "border-gray-300"}`}
                      >
                        {pendingCustomer?.id === c.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <Button
                onClick={() => {
                  if (pendingCustomer) setSelectedCustomer(pendingCustomer);
                  setSelectCustomerOpen(false);
                }}
                disabled={!pendingCustomer}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
              >
                Select Customer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {addCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <p className="font-bold text-lg">Create New Customer</p>
              <button onClick={() => setAddCustomerOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">
                  Customer Name <span className="text-red-500">*</span>
                </p>
                <Input
                  placeholder="Enter customer name"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="h-12"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Email Address</p>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="h-12"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </p>
                <Input
                  placeholder="Enter phone number"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="h-12"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Customer Type</p>
                <select
                  value={newCustomer.type}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, type: e.target.value })
                  }
                  className="w-full h-12 rounded-lg border px-3"
                >
                  <option value="">Select customer type</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Business Address</p>
                <PlacesAutocompleteInput
                  placeholder="Enter full business address"
                  value={newCustomer.address}
                  onChange={(addressData) => {
                    if (typeof addressData === "string")
                      setNewCustomer({ ...newCustomer, address: addressData });
                    else
                      setNewCustomer({
                        ...newCustomer,
                        address: addressData.name,
                      });
                  }}
                  className="h-12 w-full"
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3 sticky bottom-0 bg-white">
              <Button
                onClick={() => setAddCustomerOpen(false)}
                variant="outline"
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomer}
                disabled={
                  addingCustomer ||
                  !newCustomer.name.trim() ||
                  !newCustomer.phone.trim()
                }
                className="flex-1 bg-[#0A6DC0] hover:bg-[#09599a] h-11"
              >
                Create Customer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {discountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-bold">Add Discount</p>
              <button onClick={() => setDiscountModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <Input
                type="number"
                placeholder="Enter discount amount"
                value={tempDiscount}
                onChange={(e) => setTempDiscount(e.target.value)}
              />
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button
                onClick={() => setDiscountModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setActiveDiscount(tempDiscount);
                  setShowDiscountInput(true);
                  setDiscountModalOpen(false);
                }}
                className="flex-1 bg-[#0A6DC0] hover:bg-[#09599a]"
              >
                Add Discount
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empties Modal */}
      {emptiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-bold">Selling with Empties?</p>
              <button onClick={() => setEmptiesModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-[#EEF5FB] p-3 rounded-lg">
                <p className="text-xs text-[#0A6DC0] font-medium">
                  Available Empties in Store
                </p>
                <p className="font-bold text-lg">
                  {parseFloat(activeItem?.empties_qty || "0").toFixed(0)} units
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9E9A9A]">Empties Qty</p>
                <Input
                  type="number"
                  placeholder="Enter empties Qty"
                  value={tempEmpties}
                  onChange={(e) => setTempEmpties(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs text-[#9E9A9A]">Empties Price</p>
                <p className="font-semibold">
                  {fmt(parseFloat(activeItem?.empties_price || "0"))}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#9E9A9A]">Sales Mode</p>
                {(["SELL", "CREDIT"] as const).map((em) => (
                  <label
                    key={em}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${tempEmptiesMode === em ? "border-[#0A6DC0] bg-[#0A6DC0] hover:bg-[#09599a]" : "border-gray-300"}`}
                      onClick={() => setTempEmptiesMode(em)}
                    >
                      {tempEmptiesMode === em && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {em === "SELL" ? "Sell Empties" : "Empties On Credit"}
                      </p>
                      <p className="text-xs text-[#9E9A9A]">
                        {em === "SELL"
                          ? "Sell both drinks and empties"
                          : "Get drinks for empties and pay later"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button
                onClick={() => setEmptiesModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const emptiesQty = parseFloat(tempEmpties);
                  const availableEmpties = parseFloat(
                    activeItem?.empties_qty || "0",
                  );
                  if (emptiesQty > availableEmpties) {
                    toast.error(`Only ${availableEmpties} empties available`);
                    return;
                  }
                  setActiveEmpties(tempEmpties);
                  setActiveEmptiesMode(tempEmptiesMode);
                  setShowEmptiesInput(true);
                  setEmptiesModalOpen(false);
                }}
                className="flex-1 bg-[#0A6DC0] hover:bg-[#09599a]"
              >
                Add Empties
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
