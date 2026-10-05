/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { ThreeDots } from "react-loader-spinner";
import { useStores, useStoreStocks } from "@/hooks/useStores";
import { useCustomers, useCreateCustomer } from "@/hooks/useCustomers";
import { useCreateInvoice } from "@/hooks/useInventoryOverview";

import PlacesAutocompleteInput from "@/hooks/googleMap";
import EditStockPriceModal from "./chunks/EditStockPriceModal";
import {
  formatQty,
  formatPacks,
  formatPieces,
  piecesOf,
} from "@/lib/priceInput";
import TourPackDemo from "@/components/tour/TourPackDemo";

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

// Kobo shown exactly when there is any (₦1,257.75), never ₦40.5.
const fmt = (n: number) => {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const whole = Number.isInteger(v);
  return `₦${v.toLocaleString("en-NG", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
};

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

export default function SellPage() {
  const router = useRouter();
  const createInvoiceMutation = useCreateInvoice();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const {
    data: allStores = [],
    isLoading: storesLoading,
    error: storesError,
  } = useStores();

  const [editingDiscountIndex, setEditingDiscountIndex] = useState<
    number | null
  >(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedStockForPrice, setSelectedStockForPrice] =
    useState<StockItem | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [changeStoreOpen, setChangeStoreOpen] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [pendingStore, setPendingStore] = useState<Store | null>(null);

  const [stockSearch, setStockSearch] = useState("");

  // Active item (expanded product card)
  const [activeStockId, setActiveStockId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<SellMode>("PACKS");
  const [activeQty, setActiveQty] = useState<string>("1");

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  // Cart line whose empties are being edited (one-touch selling).
  const [editingEmptiesIndex, setEditingEmptiesIndex] = useState<number | null>(
    null,
  );
  const [tempDiscount, setTempDiscount] = useState<string>("");

  // Empties modal
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

  useEffect(() => {
    if (!storesLoading && !storesError && allStores.length > 0) {
      const valid: Store[] = (allStores as Store[]).filter(
        (s) => !s.credit_store,
      );
      setStores(valid);

      // Only set selected store if none is selected yet
      if (valid.length > 0 && !selectedStore) {
        setSelectedStore(valid[0]);
      }
    }
  }, [allStores, storesError, storesLoading, selectedStore]);

  const {
    data: stock = [],
    isLoading: stockLoading,
    refetch: refetchStock,
  } = useStoreStocks(selectedStore?.id || "");

  const openItem = (item: StockItem) => {
    // One-touch selling: the row shows what's already in the cart (0 if not).
    const line = cart.find((c) => c.stock.id === item.id);
    setActiveStockId(item.id);
    setActiveMode(line?.mode ?? "PACKS");
    setActiveQty(String(line?.quantity ?? 0));
    // Set the display mode for this item when opened (optional)
    setItemDisplayModes((prev) => ({
      ...prev,
      [item.id]: "PACKS",
    }));
  };

  const activeItem = stock.find((s) => s.id === activeStockId) ?? null;

  const activePrice = activeItem ? unitPrice(activeItem, activeMode) : 0;

  /**
   * One-touch selling: sets the product's cart line to `qty` in `mode` straight
   * away (0 removes it). The line keeps its discount and empties. Over-stock
   * or fractional pieces are refused with the same messages as before.
   */
  const setLineQty = (item: StockItem, mode: SellMode, qty: number) => {
    const perPack = item.product.items_per_pack || 1;
    const availablePacks = parseFloat(item.quantity);
    if (qty < 0 || !Number.isFinite(qty)) return;
    if (mode === "PIECES" && !Number.isInteger(qty)) {
      toast.error("Pieces quantity cannot be decimal. Enter a whole number.");
      return;
    }
    const packs = mode === "PACKS" ? qty : qty / perPack;
    if (packs > availablePacks + 1e-9) {
      toast.error(
        mode === "PACKS"
          ? `Only ${formatPacks(availablePacks, perPack)} available in stock`
          : `Only ${formatQty(piecesOf(availablePacks, perPack))} pieces available in stock (${formatPacks(availablePacks, perPack)})`,
      );
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.stock.id === item.id);
      if (qty === 0) return idx < 0 ? prev : prev.filter((_, i) => i !== idx);
      if (idx < 0) {
        return [
          ...prev,
          {
            stock: item,
            quantity: qty,
            mode,
            discount: 0,
            empties: 0,
            emptiesMode: null,
            packsQuantity: packs,
          },
        ];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: qty, mode, packsQuantity: packs };
      return next;
    });
  };

  const stepFor = (mode: SellMode) => (mode === "PACKS" ? 0.5 : 1);

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
              toast.error(
                `Only ${formatPacks(availablePacks, ci.stock.product.items_per_pack)} available`,
              );
              return ci;
            }
          } else {
            const availablePieces = piecesOf(
              availablePacks,
              ci.stock.product.items_per_pack,
            );
            const newPieces = Math.max(1, ci.quantity + delta);
            if (newPieces > availablePieces) {
              toast.error(
                `Only ${formatQty(availablePieces)} pieces available`,
              );
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
  const goodsTotal = cart.reduce((s, ci) => s + itemSubtotal(ci), 0);
  // The store charges 7.5% VAT on the goods after discount (empties are a
  // deposit, never taxed) — the same rule the server applies at checkout,
  // per line, rounded to the kobo. The invoice total is the server's.
  const storeAddsVat = Boolean((selectedStore as any)?.settings?.add_vat);
  const vatTotal = storeAddsVat
    ? cart.reduce((s, ci) => {
        const goods =
          Math.max(0, unitPrice(ci.stock, ci.mode) - ci.discount) * ci.quantity;
        return s + Math.round(goods * 0.075 * 100) / 100;
      }, 0)
    : 0;
  const totalAmount = goodsTotal + vatTotal;
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
      const response = await createCustomer.mutateAsync({
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
          let quantityToSend;
          if (ci.mode === "PACKS") {
            quantityToSend = ci.quantity;
          } else {
            quantityToSend = ci.quantity;
          }

          return {
            stock_id: ci.stock.id,
            quantity: quantityToSend,
            delivery: false,
            mode: ci.mode,
            discounted_amount: ci.discount * ci.quantity,
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

      const response = await createInvoiceMutation.mutateAsync(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Invoice created successfully!");
        const invoiceId = response.data?.id;

        router.push(`/inventory/sell/pay?invoiceId=${invoiceId}`);
      } else {
        toast.error(response.error || "Failed to create invoice");
      }
    } catch (error: any) {
      console.error("Invoice creation error:", error);
      toast.error(error?.message || "Failed to create invoice");
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
    (c: Customer) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch),
  );

  return (
    <div className="">
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
                      ₦{selectedStore.stock_value?.toLocaleString()}{" "}
                      &nbsp;·&nbsp;
                    </span>{" "}
                  </div>
                  <div className="text-[13px] text-[#2F2F2F] flex items-center gap-2">
                    <p>Product Count:</p>
                    <span className="text-[#9E9A9A]">
                      ₦{selectedStore.stock_count}
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
          <TourPackDemo />
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
                              <span className="ml-1 md:ml-2 text-[8px] md:text-xs text-white bg-[#0A6DC0] px-1.5 py-0.5 rounded-full">
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
                            ? formatPacks(
                                item.quantity,
                                item.product.items_per_pack,
                              )
                            : `${formatPieces(item.quantity, item.product.items_per_pack)} pieces`}
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
                                // The cart line follows the unit (pieces whole).
                                const q = parseFloat(activeQty) || 0;
                                if (q > 0) {
                                  const nq = m === "PIECES" ? Math.floor(q) : q;
                                  setActiveQty(String(nq));
                                  setLineQty(item, m, nq);
                                }
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
                            onClick={() => {
                              const q = Math.max(
                                0,
                                (parseFloat(activeQty) || 0) - stepFor(activeMode),
                              );
                              setActiveQty(String(q));
                              setLineQty(item, activeMode, q);
                            }}
                            className="w-16 h-10 rounded-lg border border-[#E4E4E4] flex items-center justify-center text-[#2F2F2F] hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <Input
                            type="number"
                            value={activeQty}
                            onChange={(e) => {
                              setActiveQty(e.target.value);
                              const q =
                                e.target.value.trim() === ""
                                  ? 0
                                  : parseFloat(e.target.value);
                              if (Number.isFinite(q)) setLineQty(item, activeMode, q);
                            }}
                            className="w-full bg-white text-center font-semibold border-[#D8D8D866]"
                            min={0}
                            step={stepFor(activeMode)}
                          />
                          <button
                            onClick={() => {
                              const q =
                                (parseFloat(activeQty) || 0) + stepFor(activeMode);
                              setActiveQty(String(q));
                              setLineQty(item, activeMode, q);
                            }}
                            className="w-16 h-10 rounded-lg border border-[#E4E4E4] flex items-center justify-center text-[#2F2F2F] hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {/* <span className="text-sm text-[#9E9A9A]">Packs</span> */}
                        </div>

                        <p className="text-xs text-[#9E9A9A]">
                          Changes go straight to the cart. Add discounts and
                          empties on the cart.
                        </p>
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

                    {/* Discount and empties are set on the cart line. */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDiscountIndex(idx);
                          setTempDiscount(ci.discount > 0 ? ci.discount.toString() : "");
                          setDiscountModalOpen(true);
                        }}
                        className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-left text-[13px] ${ci.discount > 0 ? "border-[#0A6DC0]" : "border-[#D8D8D866] text-center text-[#0A6DC0] font-semibold"}`}
                      >
                        {ci.discount > 0 ? (
                          <>
                            <span className="block font-bold text-[#2F2F2F]">
                              {fmt(ci.discount)} <Edit size={12} className="inline text-[#0A6DC0]" />
                            </span>
                            <span className="block text-[11.5px] text-[#9E9A9A]">
                              Discount per {ci.mode === "PACKS" ? "pack" : "piece"} · {fmt(ci.discount * ci.quantity)} total
                            </span>
                          </>
                        ) : (
                          "+ Add discount"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmptiesIndex(idx);
                          setTempEmpties(ci.empties > 0 ? ci.empties.toString() : "");
                          setTempEmptiesMode(ci.emptiesMode ?? "SELL");
                        }}
                        className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-left text-[13px] ${ci.empties > 0 ? "border-[#0A6DC0]" : "border-[#D8D8D866] text-center text-[#0A6DC0] font-semibold"}`}
                      >
                        {ci.empties > 0 ? (
                          <>
                            <span className="block font-bold text-[#2F2F2F]">
                              {ci.empties} <Edit size={12} className="inline text-[#0A6DC0]" />
                            </span>
                            <span className="block text-[11.5px] text-[#9E9A9A]">
                              {ci.emptiesMode === "CREDIT" ? "Empties owed" : "Empties sold"}
                            </span>
                          </>
                        ) : (
                          "+ Add empties"
                        )}
                      </button>
                    </div>
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
                    {fmt(goodsTotal)}
                  </span>
                </div>
                {vatTotal > 0 && (
                  <div className="flex justify-between text-[#9E9A9A]">
                    <span>VAT (7.5%)</span>
                    <span className="font-medium text-[#2F2F2F]">
                      {fmt(vatTotal)}
                    </span>
                  </div>
                )}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-[#9E9A9A]">
                    <span>Total Discount</span>
                    <span className="font-medium text-[#2F2F2F]">
                      {fmt(totalDiscount)}
                    </span>
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
              {creatingInvoice ? "Creating..." : "Create Invoice"}
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

      {/* Cart line empties */}
      {editingEmptiesIndex !== null && cart[editingEmptiesIndex] && (() => {
        const ci = cart[editingEmptiesIndex];
        const inStock = Math.floor(parseFloat(ci.stock.empties_qty) || 0);
        const qty = parseFloat(tempEmpties) || 0;
        const over = tempEmptiesMode === "SELL" && qty > inStock;
        const price = parseFloat(ci.stock.empties_price) || 0;
        const close = () => {
          setEditingEmptiesIndex(null);
          setTempEmpties("");
        };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
                <p className="font-bold text-[#2F2F2F]">
                  {ci.empties > 0 ? "Edit empties" : "Selling with empties?"}
                </p>
                <button onClick={close}>
                  <X className="w-5 h-5 text-[#9E9A9A]" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(["SELL", "CREDIT"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTempEmptiesMode(m)}
                      className={`py-2 rounded-lg text-sm font-medium border ${tempEmptiesMode === m ? "bg-[#0A6DC00D] border-[#0A6DC0] text-[#0A6DC0]" : "bg-[#F5F6FA] border-transparent text-[#9E9A9A]"}`}
                    >
                      {m === "SELL" ? "Sell empties" : "Empties on credit"}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-[#2F2F2F]">Empties qty</p>
                  <Input
                    type="number"
                    min={0}
                    value={tempEmpties}
                    onChange={(e) => setTempEmpties(e.target.value)}
                    className="border-[#E4E4E4]"
                  />
                  {tempEmptiesMode === "SELL" && (
                    <p className={`text-xs ${over ? "text-red-600" : "text-[#9E9A9A]"}`}>
                      {over
                        ? `Only ${inStock} empties available in stock`
                        : `${inStock} empties in stock · ${fmt(price)} each`}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-[#F0F0F0] flex gap-2">
                <Button onClick={close} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  disabled={over}
                  onClick={() => {
                    const n = Math.max(0, Math.floor(qty));
                    setCart((prev) =>
                      prev.map((c, i) =>
                        i === editingEmptiesIndex
                          ? { ...c, empties: n, emptiesMode: n > 0 ? tempEmptiesMode : null }
                          : c,
                      ),
                    );
                    close();
                  }}
                  className="flex-1 bg-[#0A6DC0] hover:bg-[#09599a] text-white"
                >
                  {ci.empties > 0 ? "Save empties" : "Add empties"}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

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
                  {filteredCustomers.map((c: Customer) => (
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
              const result = await refetchStock();
              const updatedStockData = result.data;

              if (updatedStockData) {
                // Find the updated stock item
                const updatedStock = updatedStockData.find(
                  (s: StockItem) => s.id === selectedStockForPrice.id,
                );

                if (updatedStock) {
                  // Update the selectedStockForPrice state so the modal gets new prices next time
                  setSelectedStockForPrice(updatedStock);

                  // Update cart items with new stock prices
                  setCart((prevCart) =>
                    prevCart.map((cartItem) => {
                      if (cartItem.stock.id === selectedStockForPrice.id) {
                        return {
                          ...cartItem,
                          stock: updatedStock,
                        };
                      }
                      return cartItem;
                    }),
                  );
                }
              }
            }
            setPriceModalOpen(false);
            setSelectedStockForPrice(null);
          }}
        />
      )}
    </div>
  );
}
