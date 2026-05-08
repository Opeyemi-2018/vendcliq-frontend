/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  Search,
  Store as StoreIcon,
  Check,
  ChevronRight,
  Minus,
  Plus,
  User,
  Tag,
  Package,
  ExternalLink,
  MapPin,
  Mail,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { ThreeDots } from "react-loader-spinner";
import { getStores } from "@/actions/stores";
import { getCustomers } from "@/actions/getcustomers";
import { getStoreStock } from "@/actions/getUserStocks";
import {
  handleCreateInvoice,
  handleCreateCustomer,
} from "@/lib/utils/api/apiHelper";
import PlacesAutocompleteInput from "@/hooks/googleMap";
import EditStockPriceModal from "./chunks/EditStockPriceModal";

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
  quantity: number; // This stores the original quantity (packs OR pieces based on mode)
  mode: SellMode;
  discount: number;
  empties: number;
  emptiesMode: "SELL" | "CREDIT" | null;
  // Add this to store the packs equivalent for API
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
  // Product total with discount applied using the original quantity
  const productTotal = discounted * ci.quantity;

  // Empties total WITHOUT discount (full price)
  const emptiesTotal =
    ci.empties > 0 ? parseFloat(ci.stock.empties_price) * ci.empties : 0;

  return productTotal + emptiesTotal;
};

const imgSrc = (src: string | null) => {
  if (!src) return null;
  return src.startsWith("//") ? `https:${src}` : src;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SellPage() {
  const router = useRouter();

  const [editingDiscountIndex, setEditingDiscountIndex] = useState<
    number | null
  >(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedStockForPrice, setSelectedStockForPrice] =
    useState<StockItem | null>(null);
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

  // Active item (expanded product card)
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

  // Empties modal
  const [emptiesModalOpen, setEmptiesModalOpen] = useState(false);
  const [tempEmpties, setTempEmpties] = useState<string>("");
  const [tempEmptiesMode, setTempEmptiesMode] = useState<"SELL" | "CREDIT">(
    "SELL",
  );
  const [itemDisplayModes, setItemDisplayModes] = useState<
    Record<string, "PACKS" | "PIECES">
  >({});

  const [mobileView, setMobileView] = useState<"items" | "cart">("items");

  // Cart / Invoice
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

  // Invoice creation
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  // Add new customer - single state object
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
    address: "",
  });

  // ── Fetch stores ─────────────────────────────────────────────────────────

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
        if (valid.length > 0) setSelectedStore(valid[0]);
      } else {
        toast.error(result.error || "Failed to load stores");
      }
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setStoresLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, []);

  // ── Fetch stock when store changes ───────────────────────────────────────

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

  useEffect(() => {
    if (selectedStore) fetchStock(selectedStore.id);
  }, [selectedStore]);

  // ── Fetch customers ──────────────────────────────────────────────────────

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

  // ── Active item helpers ──────────────────────────────────────────────────

  const openItem = (item: StockItem) => {
    setActiveStockId(item.id);
    setActiveMode("PACKS");
    setActiveQty("1");
    setActiveDiscount("");
    setActiveEmpties("");
    setActiveEmptiesMode("SELL");
    setShowDiscountInput(false);
    setShowEmptiesInput(false);
    // Set the display mode for this item when opened (optional)
    setItemDisplayModes((prev) => ({
      ...prev,
      [item.id]: "PACKS",
    }));
  };

  const activeItem = stock.find((s) => s.id === activeStockId) ?? null;

  const activePrice = activeItem ? unitPrice(activeItem, activeMode) : 0;

  const previewSubtotal = (() => {
    if (!activeItem) return 0;
    const qty = parseFloat(activeQty) || 0;
    const disc = parseFloat(activeDiscount) || 0;
    const empties = parseFloat(activeEmpties) || 0;

    // Product total with discount applied per unit
    const discountedProductPrice = Math.max(0, activePrice - disc);
    const productTotal = discountedProductPrice * qty;

    // Empties total WITHOUT discount (full price)
    const emptiesPrice = parseFloat(activeItem.empties_price) || 0;
    const emptiesTotal =
      showEmptiesInput && empties > 0 ? emptiesPrice * empties : 0;

    return productTotal + emptiesTotal;
  })();

  const handleAddToCart = () => {
    if (!activeItem) return;
    const qty = parseFloat(activeQty);
    if (!qty || qty <= 0) return toast.error("Enter a valid quantity");

    // Validate pieces are in multiples of items_per_pack
    // Validate pieces are in whole numbers and multiples of items_per_pack
    // Validate pieces are in whole numbers only (no decimals)
    if (activeMode === "PIECES") {
      // First check if it's a whole number
      if (!Number.isInteger(qty)) {
        return toast.error(
          `Pieces quantity cannot be decimal. Please enter a whole number. Example: 1, 2, 3, etc.`,
        );
      }
    }

    // Get available stock
    const availablePacks = parseFloat(activeItem.quantity);
    const availablePieces = availablePacks * activeItem.product.items_per_pack;

    // Validate based on mode
    if (activeMode === "PACKS") {
      if (qty > availablePacks) {
        return toast.error(`Only ${availablePacks} packs available in stock`);
      }
    } else {
      // PIECES mode
      if (qty > availablePieces) {
        return toast.error(
          `Only ${availablePieces} pieces available in stock (${availablePacks} packs)`,
        );
      }
    }

    const empties = showEmptiesInput ? parseFloat(activeEmpties) || 0 : 0;
    const discount = showDiscountInput ? parseFloat(activeDiscount) || 0 : 0;

    // Check empties availability
    const availableEmpties = parseFloat(activeItem.empties_qty);
    if (empties > availableEmpties) {
      return toast.error(`Only ${availableEmpties} empties available in stock`);
    }

    // Calculate packs quantity for stock validation
    let packsQuantity =
      activeMode === "PACKS" ? qty : qty / activeItem.product.items_per_pack;

    // Check if adding to cart would exceed available stock
    const existingIndex = cart.findIndex(
      (c) => c.stock.id === activeItem.id && c.mode === activeMode,
    );

    let newTotalPacks = 0;
    if (existingIndex >= 0) {
      const existingItem = cart[existingIndex];
      newTotalPacks = existingItem.packsQuantity + packsQuantity;
    } else {
      newTotalPacks = packsQuantity;
    }

    if (newTotalPacks > availablePacks) {
      const availablePiecesMsg =
        availablePacks * activeItem.product.items_per_pack;
      return toast.error(
        `Cannot add more. Only ${availablePacks} packs (${availablePiecesMsg} pieces) available in total`,
      );
    }

    // Check if adding empties would exceed available
    if (existingIndex >= 0) {
      const existingItem = cart[existingIndex];
      const newTotalEmpties = existingItem.empties + empties;
      if (newTotalEmpties > availableEmpties) {
        return toast.error(
          `Cannot add more empties. Only ${availableEmpties} empties available in total`,
        );
      }
    }

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
      setCart((prev) => [
        ...prev,
        {
          stock: activeItem,
          quantity: qty, // Store original quantity
          mode: activeMode,
          discount,
          empties,
          emptiesMode: empties > 0 ? activeEmptiesMode : null,
          packsQuantity: packsQuantity, // Store packs equivalent for stock validation
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
            const newPieces = Math.max(1, ci.quantity + delta);
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

  // ── Invoice totals ───────────────────────────────────────────────────────

  const totalItems = cart.length;
  const totalAmount = cart.reduce((s, ci) => s + itemSubtotal(ci), 0);
  const totalDiscount = cart.reduce(
    (s, ci) => s + ci.discount * ci.quantity, // Remove the + ci.empties part
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
        address: {
          address: newCustomer.address,
          latitude: 0,
          longitude: 0,
        },
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        setSelectedCustomer(response.data);
        setCustomerMode("registered");
        setAddCustomerOpen(false);
        setSelectCustomerOpen(false);

        // Reset form
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          type: "",
          address: "",
        });

        toast.success("Customer created successfully");
      } else {
        toast.error(response.error || "Failed to create customer");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setAddingCustomer(false);
    }
  };

  // ── Create invoice ───────────────────────────────────────────────────────

  // ── Create invoice ───────────────────────────────────────────────────────

  const handleCreateInvoiceSubmit = async () => {
    if (!selectedStore) return toast.error("Select a store first");
    if (cart.length === 0) return toast.error("Add at least one item");

    setCreatingInvoice(true);
    try {
      const storeAddress = selectedStore.address || null;

      const payload = {
        customer_id:
          customerMode === "registered" ? selectedCustomer?.id || null : null,
        store_id: selectedStore.id,
        items: cart.map((ci) => {
          // Send quantity as-is based on mode
          let quantityToSend;
          if (ci.mode === "PACKS") {
            quantityToSend = ci.quantity; // Send packs (can be decimal like 3.5)
          } else {
            // PIECES mode - send pieces directly, no conversion
            quantityToSend = ci.quantity; // Send pieces as whole number
          }

          return {
            stock_id: ci.stock.id,
            quantity: quantityToSend, // Send packs for PACKS mode, pieces for PIECES mode
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
          };
        }),
      };

      const response = await handleCreateInvoice(payload);
      // ... rest of the code remains the same

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Invoice created successfully!");
        const invoiceId = response.data?.id;

        // Calculate additional data for the pay page
        // Calculate additional data for the pay page
        const totalQuantity = cart.reduce((sum, ci) => {
          if (ci.mode === "PACKS") {
            return sum + ci.quantity;
          } else {
            return sum + ci.quantity / ci.stock.product.items_per_pack;
          }
        }, 0);

        const totalDiscountAmount = cart.reduce(
          (sum, ci) => sum + ci.discount * ci.quantity,
          0,
        );

        // SUBTOTAL = sum of all item subtotals (which already have discount applied to products)
        const subTotal = cart.reduce((sum, ci) => sum + itemSubtotal(ci), 0);

        // Empties Value - only when Empties sales mode is "SELL"
        const emptiesValue = cart.reduce((sum, ci) => {
          if (ci.empties > 0 && ci.emptiesMode === "SELL") {
            return sum + parseFloat(ci.stock.empties_price) * ci.empties;
          }
          return sum;
        }, 0);

        // Empties Owed - sum of all Empties sold on credit
        const emptiesOwed = cart.reduce((sum, ci) => {
          if (ci.empties > 0 && ci.emptiesMode === "CREDIT") {
            return sum + ci.empties;
          }
          return sum;
        }, 0);

        // TOTAL AMOUNT = subTotal - totalDiscountAmount (this is what customer pays)
        const totalAmountPayable = subTotal;
        // Store the additional data for pay page
        const invoicePreviewData = {
          invoiceId,
          code: response.data?.code || "",
          total: totalAmountPayable, // Use calculated total, not response.data?.total
          items_count: response.data?.items_count || 0,
          storeAddress: storeAddress?.name || selectedStore.name || "",
          items: cart.map((ci, idx) => ({
            id: idx.toString(),
            stock_id: ci.stock.id,
            product_id: idx,
            quantity: ci.quantity,
            cost: unitPrice(ci.stock, ci.mode),
            discounted_amount: ci.discount,
            sub_total: itemSubtotal(ci), // This already has discount applied to product only
            mode: ci.mode,
            sku: ci.stock.sku,
            product_name: ci.stock.product.name,
            product_image: ci.stock.product.image || "",
            items_per_pack: ci.stock.product.items_per_pack,
            empties: ci.empties,
            emptiesMode: ci.emptiesMode,
            empties_price: parseFloat(ci.stock.empties_price),
          })),
          totalQuantity,
          totalDiscountAmount,
          subTotal, // This is the subtotal BEFORE discount
          emptiesValue,
          emptiesOwed,
          customerName: selectedCustomer?.name || null,
          storeName: selectedStore.name,
          storePhone: selectedStore.phone || "",
        };

        localStorage.setItem(
          `invoice-preview-${invoiceId}`,
          JSON.stringify(invoicePreviewData),
        );

        router.push(`/inventory/sell/pay?invoiceId=${invoiceId}`);
      } else {
        toast.error(response.error || "Failed to create invoice");
      }
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setCreatingInvoice(false);
    }
  };

  // ── Filtered lists ───────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="">
      {/* Page header */}
      <div className="  pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2F2F2F] font-clash">
          Sell
        </h1>
        <p className="text-[#9E9A9A] text-sm font-medium">
          Sell your stock to a customer
        </p>
      </div>

      {/* Mobile toggle */}
      <div className="flex lg:hidden mb-4 rounded-xl border border-[#E4E4E4] overflow-hidden">
        <button
          onClick={() => setMobileView("items")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
            mobileView === "items"
              ? "bg-[#0A6DC0] text-white"
              : "bg-white text-[#9E9A9A]"
          }`}
        >
          See Items
        </button>
        <button
          onClick={() => setMobileView("cart")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all relative ${
            mobileView === "cart"
              ? "bg-[#0A6DC0] text-white"
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
        {" "}
        {/* ═══════════════════════════════════════════════════════════════════
            LEFT PANEL
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className={`w-full lg:w-[60%] space-y-3 bg-white rounded-2xl md:border border-[#E6E6E6] md:p-5 ${mobileView === "cart" ? "hidden lg:block" : "block"}`}
        >
          {/* Store card */}
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
            {storesLoading ? (
              <div>
                <ThreeDots height="50" width="50" color="#0A6DC0" visible />
                <p className="text-sm text-[#9E9A9A]">Loading Stores...</p>
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
                      {selectedStore.stock_value?.toLocaleString()}{" "}
                      &nbsp;·&nbsp;
                    </span>{" "}
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

          {/* Stock search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A9A] w-4 h-4" />
            <Input
              placeholder="Search SKU"
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="pl-9 bg-[#D8D8D866] border-[#F9F9F9] rounded-xl h-12"
            />
          </div>

          {/* Stock list */}
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
                    {/* Product row */}
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
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[12px] md:text-[16px] text-[#2F2F2F]  leading-tight">
                            {item.product.name}
                            {inCart && (
                              <span className="ml-2 text-xs text-white bg-[#0A6DC0] px-1.5 py-0.5 rounded-full">
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
                        <p className="font-bold text-[12px] md:text-[16px] text-[#2F2F2F] ">
                          {(itemDisplayModes[item.id] || "PACKS") === "PACKS"
                            ? `${parseFloat(item.quantity).toFixed(0)} packs`
                            : `${(parseFloat(item.quantity) * item.product.items_per_pack).toFixed(0)} pieces`}
                        </p>
                        {/* Show items_per_pack value here */}
                        <p className="text-[10px] text-[#2F2F2F] mt-0.5">
                          1 pack = {item.product.items_per_pack} pieces
                        </p>
                      </div>
                    </div>

                    {/* Expanded controls */}
                    {isActive && (
                      <div className="px-4 pb-4   space-y-4">
                        {/* Price */}
                        <p className="text-[#2F2F2F] text-[12px] md:text-[16px] font-bold ">
                          {fmt(activePrice)}
                          <span className="text-xs text-[#9E9A9A] font-normal">
                            /{activeMode === "PACKS" ? "pack" : "piece"}
                          </span>
                        </p>

                        {/* Mode toggle */}
                        {/* Mode toggle */}
                        <div className="grid grid-cols-2 gap-2">
                          {(["PACKS", "PIECES"] as SellMode[]).map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                setActiveMode(m);
                                // Update display mode for this specific item only
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

                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setActiveQty((v) =>
                                String(Math.max(0.5, parseFloat(v) - 1)),
                              )
                            }
                            className="w-16 h-10 rounded-lg border border-[#E4E4E4] flex items-center justify-center text-[#2F2F2F] hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <Input
                            type="number"
                            value={activeQty}
                            onChange={(e) => setActiveQty(e.target.value)}
                            className="w-full bg-white text-center font-semibold border-[#D8D8D866]"
                            min={0.5}
                            step={0.5}
                          />
                          <button
                            onClick={() =>
                              setActiveQty((v) => String(parseFloat(v) + 1))
                            }
                            className="w-16 h-10 rounded-lg border border-[#E4E4E4] flex items-center justify-center text-[#2F2F2F] hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {/* <span className="text-sm text-[#9E9A9A]">Packs</span> */}
                        </div>

                        {/* Action buttons */}
                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setTempDiscount(activeDiscount);
                              setDiscountModalOpen(true);
                            }}
                            className="py-2 px-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5 bg-[#F9F9F9] border-[#D8D8D866] text-[#2F2F2F]"
                          >
                            Add Discount
                          </button>
                          <button
                            onClick={() => {
                              setTempEmpties(activeEmpties);
                              setTempEmptiesMode(activeEmptiesMode);
                              setEmptiesModalOpen(true);
                            }}
                            className="py-2 px-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5 bg-[#F9F9F9] border-[#D8D8D866] text-[#2F2F2F]"
                          >
                            Sell with Empties
                          </button>
                        </div>

                        {/* Show badges if discount or empties are added */}
                        <div className="space-y-2">
                          {activeDiscount && parseFloat(activeDiscount) > 0 && (
                            <div className="flex items-center justify-between bg-[#FFF8EC] p-2 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#E89500]">
                                  Discount: {fmt(parseFloat(activeDiscount))}
                                </span>
                              </div>
                              <button
                                onClick={() => setActiveDiscount("")}
                                className="text-[#E89500] hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {activeEmpties && parseFloat(activeEmpties) > 0 && (
                            <div className="flex items-center justify-between bg-[#EEF5FB] p-2 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Package className="w-3.5 h-3.5 text-[#0A6DC0]" />
                                <span className="text-sm text-[#0A6DC0]">
                                  {activeEmpties} empties (
                                  {activeEmptiesMode === "CREDIT"
                                    ? "Credit"
                                    : "Sold"}
                                  )
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveEmpties("");
                                  setActiveEmptiesMode("SELL");
                                }}
                                className="text-[#0A6DC0] hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Empties input */}
                        {/* Empties Modal */}
                        {emptiesModalOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
                              <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
                                <p className="font-bold text-[#2F2F2F]">
                                  Selling with Empties?
                                </p>
                                <button
                                  onClick={() => {
                                    setEmptiesModalOpen(false);
                                    setTempEmpties("");
                                    setTempEmptiesMode("SELL");
                                  }}
                                >
                                  <X className="w-5 h-5 text-[#9E9A9A]" />
                                </button>
                              </div>

                              <div className="space-y-1 bg-[#EEF5FB] p-3 rounded-lg mx-4 mt-4">
                                <p className="text-xs text-[#0A6DC0] font-medium">
                                  Available Empties in Store
                                </p>
                                <p className="font-bold text-[#2F2F2F] text-lg">
                                  {parseFloat(
                                    activeItem?.empties_qty || "0",
                                  ).toFixed(0)}{" "}
                                  units
                                </p>
                              </div>

                              <div className="p-4 space-y-4">
                                <div className="space-y-1">
                                  <p className="text-xs text-[#9E9A9A]">
                                    Empties Qty
                                  </p>
                                  <Input
                                    type="number"
                                    placeholder="Enter empties Qty"
                                    value={tempEmpties}
                                    onChange={(e) =>
                                      setTempEmpties(e.target.value)
                                    }
                                    className="border-[#E4E4E4]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs text-[#9E9A9A]">
                                    Empties Price
                                  </p>
                                  <p className="font-semibold text-[#2F2F2F]">
                                    {fmt(
                                      parseFloat(
                                        activeItem?.empties_price || "0",
                                      ),
                                    )}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs text-[#9E9A9A]">
                                    Sales Mode
                                  </p>
                                  {(["SELL", "CREDIT"] as const).map((em) => (
                                    <label
                                      key={em}
                                      className="flex items-start gap-2 cursor-pointer"
                                    >
                                      <div
                                        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                          tempEmptiesMode === em
                                            ? "border-[#0A6DC0] bg-[#0A6DC0]"
                                            : "border-gray-300"
                                        }`}
                                        onClick={() => setTempEmptiesMode(em)}
                                      >
                                        {tempEmptiesMode === em && (
                                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-[#2F2F2F]">
                                          {em === "SELL"
                                            ? "Sell Empties"
                                            : "Empties On Credit"}
                                        </p>
                                        <p className="text-xs text-[#9E9A9A]">
                                          {em === "SELL"
                                            ? "Sell both drinks and empties to the customer. i.e Drink price + Empties Price"
                                            : "Get drinks for empties and pay later"}
                                        </p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="p-4 border-t border-[#F0F0F0] flex gap-2">
                                <Button
                                  onClick={() => {
                                    setEmptiesModalOpen(false);
                                    setTempEmpties("");
                                    setTempEmptiesMode("SELL");
                                  }}
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
                                      toast.error(
                                        `Only ${availableEmpties} empties available in stock`,
                                      );
                                      return;
                                    }

                                    setActiveEmpties(tempEmpties);
                                    setActiveEmptiesMode(tempEmptiesMode);
                                    setShowEmptiesInput(true);
                                    setEmptiesModalOpen(false);
                                    setTempEmpties("");
                                  }}
                                  className="flex-1 bg-[#0A6DC0] hover:bg-[#09599a] text-white"
                                >
                                  Add Empties
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Preview subtotal */}
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
                          className="w-full bg-[#0A6DC0] hover:bg-[#09599a] text-white rounded-xl h-11 font-semibold"
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
        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT PANEL — Invoice
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className={`w-full lg:w-[40%] space-y-4 ${mobileView === "items" ? "hidden lg:block" : "block"}`}
        >
          <div className="bg-white rounded-2xl md:border border-[#E4E4E4] md:p-6 sticky top-6">
            <p className="font-bold text-[#2F2F2F] text-lg mb-4">
              Invoice Details
            </p>

            {/* Customer selector */}
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

            {/* Customer details */}
            {selectedCustomer && (
              <div className="mb-3 p-3 rounded-xl border border-[#E4E4E4] bg-[#F9F9F9] flex items-center gap-2">
                <User className="w-6 h-6 " />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[13px] md:text-[16px] text-[#2F2F2F] truncate">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-[13px] text-[#2F2F2F]">
                    {selectedCustomer.phone}
                  </p>
                  {selectedCustomer.email && (
                    <p className="text-[13px] text-[#2F2F2F] truncate">
                      {selectedCustomer.email}
                    </p>
                  )}
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

            {/* Cart items */}
            {cart.length === 0 ? (
              <p className="text-center text-sm text-[#9E9A9A] py-6">
                No items added yet
              </p>
            ) : (
              <div className="space-y-4  pr-1">
                {cart.map((ci, idx) => (
                  <div
                    key={idx}
                    className="space-y-1 bg-white border border-[#D8D8D866] p-3 rounded-lg "
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2F2F2F] truncate">
                          {ci.stock.product.name}
                        </p>
                        <p className="text-xs text-[#9E9A9A]">
                          SKU: {ci.stock.sku}
                        </p>
                      </div>

                      <div className="">
                        <div className="flex items-center justify-between shrink-0 gap-4">
                          <p className="font-bold text-[#2F2F2F] text-sm">
                            {fmt(unitPrice(ci.stock, ci.mode))}
                          </p>
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setSelectedStockForPrice(ci.stock);
                              setPriceModalOpen(true);
                            }}
                            className="text-[#0A6DC0] hover:text-[#09599a]"
                            title="Edit Prices"
                          >
                            <Edit
                              size={16}
                              className="text-[#C7C7CC] hover:text-[#09599a]"
                            />
                          </button>
                          {/* Cancel/Remove Button */}
                          <button
                            onClick={() => removeCartItem(idx)}
                            className="text-red-500 hover:text-red-700"
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
                      <p className="text-[#2F2F2F] text-[13px]">
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
                      <div className="">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#2F2F2F]">
                            {fmt(ci.discount)}
                          </p>
                          <button
                            onClick={() => {
                              // Open discount edit modal for this cart item
                              setEditingDiscountIndex(idx);
                              setTempDiscount(ci.discount.toString());
                              setDiscountModalOpen(true);
                            }}
                            className="text-[#C7C7CC] hover:text-[#09599a]"
                            title="Edit Discount"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                        <p className="text-[#9E9A9A] text-[13px]">
                          Discount Added:{" "}
                        </p>
                      </div>
                    )}
                    {ci.empties > 0 && (
                      <p className="text-xs text-[#0A6DC0]">
                        {ci.empties} Empties (
                        {ci.emptiesMode === "CREDIT" ? "On Credit" : "Sold"})
                      </p>
                    )}
                    <div className="border-t border-[#D8D8D866] pt-2"></div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#9E9A9A] ">Subtotal</span>
                      <span className="text-[#2F2F2F] font-bold text-[13px] md:text-[16px]">
                        {fmt(itemSubtotal(ci))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            {cart.length > 0 && (
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-[#9E9A9A]">
                  <span>Total Items</span>
                  <span className="font-medium text-[#2F2F2F]">
                    {totalItems}
                  </span>
                </div>
                <div className="flex justify-between text-[#9E9A9A]">
                  <span>Total Amount</span>
                  <span className="font-medium text-[#2F2F2F]">
                    {fmt(totalAmount)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-[#9E9A9A]">
                    <span>Total Discount</span>
                    <span className="font-medium ">{fmt(totalDiscount)}</span>
                  </div>
                )}
                {totalEmpties > 0 && (
                  <div className="flex justify-between text-[#9E9A9A]">
                    <span>Empties Owed</span>
                    <span className="font-medium text-[#2F2F2F]">
                      {totalEmpties}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#2F2F2F] pt-2 border-t border-[#F0F0F0]">
                  <span>Amount Payable</span>
                  <span>{fmt(totalAmount)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateInvoiceSubmit}
              disabled={creatingInvoice || cart.length === 0}
              className="w-full mt-4 bg-[#0A6DC0] hover:bg-[#09599a] text-white rounded-xl h-12 font-semibold text-base"
            >
              {creatingInvoice ? "Creating..." : "Select Payment Method"}
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CHANGE STORE MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {changeStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
              <p className="font-bold text-[#2F2F2F]">Change Store</p>
              <button onClick={() => setChangeStoreOpen(false)}>
                <X className="w-5 h-5 text-[#9E9A9A]" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A9A] w-4 h-4" />
                <Input
                  placeholder="Search"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="pl-9 bg-[#F5F6FA] border-transparent"
                />
              </div>

              <p className="text-xs text-[#9E9A9A]">
                Select the store you want to sell from
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredStores.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setPendingStore(s)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      pendingStore?.id === s.id
                        ? "border-[#0A6DC0] bg-[#EEF5FB]"
                        : "border-[#E4E4E4] hover:bg-gray-50"
                    }`}
                  >
                    <Image
                      src="/store.svg"
                      width={20}
                      height={20}
                      alt="store"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#2F2F2F] text-sm">
                        {s.name}
                      </p>
                      <p className="text-xs text-[#9E9A9A]">
                        Inventory value: {s.stock_value?.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#9E9A9A]">
                        Product Count: {s.stock_count}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        pendingStore?.id === s.id
                          ? "border-[#0A6DC0] bg-[#0A6DC0]"
                          : "border-gray-300"
                      }`}
                    >
                      {pendingStore?.id === s.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#F0F0F0]">
              <Button
                onClick={() => {
                  if (pendingStore) {
                    setSelectedStore(pendingStore);
                    setCart([]);
                  }
                  setChangeStoreOpen(false);
                }}
                disabled={!pendingStore}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] text-white rounded-xl h-11 font-semibold"
              >
                Select Store
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {discountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
              <p className="font-bold text-[#2F2F2F]">Add Discount</p>
              <button onClick={() => setDiscountModalOpen(false)}>
                <X className="w-5 h-5 text-[#9E9A9A]" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#2F2F2F]">Discount</p>
                <Input
                  type="number"
                  placeholder="Enter discount amount"
                  value={tempDiscount}
                  onChange={(e) => setTempDiscount(e.target.value)}
                  className="border-[#E4E4E4]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#F0F0F0] flex gap-2">
              <Button
                onClick={() => {
                  setDiscountModalOpen(false);
                  setEditingDiscountIndex(null);
                  setTempDiscount("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const discountValue = parseFloat(tempDiscount) || 0;

                  if (editingDiscountIndex !== null) {
                    // Update existing cart item discount
                    const updated = [...cart];
                    updated[editingDiscountIndex] = {
                      ...updated[editingDiscountIndex],
                      discount: discountValue,
                    };
                    setCart(updated);
                    setEditingDiscountIndex(null);
                    toast.success("Discount updated!");
                  } else if (activeItem) {
                    // Add new discount to active item
                    setActiveDiscount(tempDiscount);
                    setShowDiscountInput(true);
                  }

                  setDiscountModalOpen(false);
                  setTempDiscount("");
                }}
                className="flex-1 bg-[#0A6DC0] hover:bg-[#09599a] text-white"
              >
                {editingDiscountIndex !== null
                  ? "Update Discount"
                  : "Add Discount"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SELECT CUSTOMER MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {selectCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
              <p className="font-bold text-[#2F2F2F]">Select Customer</p>
              <button onClick={() => setSelectCustomerOpen(false)}>
                <X className="w-5 h-5 text-[#9E9A9A]" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A9A] w-4 h-4" />
                <Input
                  placeholder="Search"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9 bg-[#F5F6FA] border-transparent"
                />
              </div>

              <button
                onClick={() => {
                  setSelectCustomerOpen(false);
                  setAddCustomerOpen(true);
                }}
                className="text-[#0A6DC0] text-sm font-semibold flex items-center gap-1 hover:underline"
              >
                + Add New Customer
              </button>

              {customersLoading ? (
                <div className="flex justify-center py-8">
                  <ThreeDots height="40" width="40" color="#0A6DC0" visible />
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setPendingCustomer(c)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        pendingCustomer?.id === c.id
                          ? "border-[#0A6DC0] bg-[#EEF5FB]"
                          : "border-[#E4E4E4] hover:bg-gray-50"
                      }`}
                    >
                      <User className="w-4 h-4 " />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2F2F2F] truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-[#9E9A9A]">{c.phone}</p>
                        {c.email && (
                          <p className="text-xs text-[#9E9A9A] truncate">
                            {c.email}
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          pendingCustomer?.id === c.id
                            ? "border-[#0A6DC0] bg-[#0A6DC0]"
                            : "border-gray-300"
                        }`}
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

            <div className="p-4 border-t border-[#F0F0F0]">
              <Button
                onClick={() => {
                  if (pendingCustomer) setSelectedCustomer(pendingCustomer);
                  setSelectCustomerOpen(false);
                }}
                disabled={!pendingCustomer}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] text-white rounded-xl h-11 font-semibold"
              >
                Select Customer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW CUSTOMER MODAL */}
      {addCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0] sticky top-0 bg-white z-10">
              <p className="font-bold text-[#2F2F2F] text-lg">
                Create New Customer
              </p>
              <button onClick={() => setAddCustomerOpen(false)} className="p-1">
                <X className="w-5 h-5 text-[#9E9A9A]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Customer Name */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#2F2F2F]">
                  Customer Name <span className="text-red-500">*</span>
                </p>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A9A] w-4 h-4" />
                  <Input
                    placeholder="Enter customer name"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    className="pl-9 bg-[#F5F6FA] border-transparent h-12"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#2F2F2F]">
                  Email Address
                </p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A9A] w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    className="pl-9 bg-[#F5F6FA] border-transparent h-12"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#2F2F2F]">
                  Phone Number <span className="text-red-500">*</span>
                </p>
                <Input
                  placeholder="Enter phone number"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="bg-[#F5F6FA] border-transparent h-12"
                />
              </div>

              {/* Customer Type */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#2F2F2F]">
                  Customer Type
                </p>
                <select
                  value={newCustomer.type}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, type: e.target.value })
                  }
                  className="w-full h-12 rounded-lg bg-[#F5F6FA] border-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0A6DC0]"
                >
                  <option value="">Select customer type</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                </select>
              </div>

              {/* Address */}
              {/* Address with Autocomplete */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#2F2F2F]">
                  Business Address
                </p>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A9A] w-4 h-4 z-10" />
                  <PlacesAutocompleteInput
                    placeholder="Enter full business address"
                    value={newCustomer.address}
                    onChange={(addressData) => {
                      if (typeof addressData === "string") {
                        setNewCustomer({
                          ...newCustomer,
                          address: addressData,
                        });
                      } else {
                        setNewCustomer({
                          ...newCustomer,
                          address: addressData.name,
                        });
                      }
                    }}
                    className="pl-9 bg-[#F5F6FA] border-transparent h-12 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#F0F0F0] flex gap-3 sticky bottom-0 bg-white">
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
                className="flex-1 bg-[#0A6DC0] hover:bg-[#09599a] text-white h-11 font-semibold"
              >
                {addingCustomer ? "Creating..." : "Create Customer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {selectedStockForPrice && (
        <EditStockPriceModal
          isOpen={priceModalOpen}
          onClose={() => {
            setPriceModalOpen(false);
            setSelectedStockForPrice(null);
          }}
          stockId={selectedStockForPrice.id}
          currentPrices={{
            selling_price: selectedStockForPrice.selling_price,
            selling_price_pieces: selectedStockForPrice.selling_price_pieces,
            empties_price: selectedStockForPrice.empties_price,
          }}
          onSuccess={async () => {
            // Refresh stock data to get updated prices
            if (selectedStore) {
              await fetchStock(selectedStore.id);
            }
          }}
        />
      )}
    </div>
  );
}
