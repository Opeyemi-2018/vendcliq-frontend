/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerForm, customerSchema } from "@/types/customer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  Trash2,
  UserRound,
  X,
  Edit,
} from "lucide-react";
import { getStores } from "@/actions/stores";
import { getCustomers } from "@/actions/getcustomers";
import { getStoreStock } from "@/actions/getUserStocks";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EditStockPriceModal from "./chunks/EditStockPriceModal";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import PlacesAutocompleteInput from "@/hooks/googleMap";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  handleCreateCustomer,
  handleCreateInvoice,
} from "@/lib/utils/api/apiHelper";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StoreType {
  id: string;
  name: string;
  stock_value: string;
  stock_count: string;
  address?: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface CustomerType {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  address: string;
}

interface StockItem {
  selling_price_pieces: string;
  id: string;
  sku: string;
  quantity: string;
  selling_price: string;
  empties_price: string;
  product: {
    name: string;
    image: string;
  };
}

interface InvoiceItem {
  stock_id: string;
  product_name: string;
  sku: string;
  product_image: string;
  quantity: number;
  mode: "PACKS" | "PIECES";
  price: number;
  discounted_amount: number;
  payable_amount: number;
  empties?: { type: "CREDIT" | "SELL"; quantity: number };
}

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Sell = () => {
  const router = useRouter();
  const [isEditPriceModalOpen, setIsEditPriceModalOpen] = useState(false);
  const [currentStockPrices, setCurrentStockPrices] = useState({
    selling_price: "",
    selling_price_pieces: "",
    empties_price: "",
  });

  const handleOpenPriceEditModal = () => {
    if (!selectedStockItem) {
      toast.error("Please select a product first");
      return;
    }

    setCurrentStockPrices({
      selling_price: selectedStockItem.selling_price || "",
      selling_price_pieces: selectedStockItem.selling_price_pieces || "0",
      empties_price: selectedStockItem.empties_price || "0",
    });
    setIsEditPriceModalOpen(true);
  };

  const handlePriceUpdateSuccess = async () => {
    // Refresh stock data after successful update
    if (selectedStore) {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const result = await getStoreStock(token, selectedStore.id);
        if (result.success && result.data) {
          setStoreStock(result.data);

          // Update the selected stock item with new prices
          const updatedStock = result.data.find(
            (s: StockItem) => s.id === selectedStockItem?.id,
          );
          if (updatedStock) {
            setSelectedStockItem(updatedStock);
            invoiceForm.setValue("price", updatedStock.selling_price);
          }
        }
      } catch (err) {
        console.error("Error refreshing stock:", err);
      }
    }
  };

  const [stage, setStage] = useState<
    "select-store" | "select-customer" | "invoice"
  >("select-store");
  const [stores, setStores] = useState<StoreType[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(
    null,
  );
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [customerOptionSelected, setCustomerOptionSelected] = useState<
    "list" | "walk-in" | null
  >(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [storeStock, setStoreStock] = useState<StockItem[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [showEmptiesModal, setShowEmptiesModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(
    null,
  );
  const [emptiesQuantityInput, setEmptiesQuantityInput] = useState("");
  const [isPriceEditable, setIsPriceEditable] = useState(false);

  const customerForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: undefined,
      address: { address: "", latitude: 0, longitude: 0 },
    },
  });

  const invoiceForm = useForm({
    defaultValues: {
      stock_id: "",
      quantity: "1",
      delivery: false,
      mode: "PACKS",
      discounted_amount: "0",
      empties_type: "",
      empties_quantity: "",
      store_address: "",
      price: "",
      payable_amount: "",
    },
  });

  // Live calculation for payable_amount display
  useEffect(() => {
    const values = invoiceForm.getValues();
    const price = parseFloat(values.price || "0");
    const quantity = parseFloat(values.quantity || "0");
    const discount = parseFloat(values.discounted_amount || "0");
    const emptiesQty = parseFloat(values.empties_quantity || "0");
    const emptiesPrice = parseFloat(selectedStockItem?.empties_price || "0");

    const perUnitPayable = price - discount;
    const totalPayable = perUnitPayable * quantity + emptiesQty * emptiesPrice;

    invoiceForm.setValue("payable_amount", totalPayable.toFixed(2));
  }, [
    invoiceForm.watch("price"),
    invoiceForm.watch("quantity"),
    invoiceForm.watch("discounted_amount"),
    invoiceForm.watch("empties_quantity"),
    selectedStockItem?.empties_price,
  ]);

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoadingStores(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Please log in");
          return;
        }
        const result = await getStores(token);
        if (result.success && result.data) {
          const storeNames = result.data.map((store: any) => ({
            id: store.id,
            name: store.name,
            stock_count: store.stock_count,
            stock_value: store.stock_value?.toLocaleString() || "0",
            address: store.address,
          }));
          setStores(storeNames);
          setFilteredStores(storeNames);
        } else {
          setError(result.error || "Failed to load stores");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setIsLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredStores(stores);
    } else {
      setFilteredStores(
        stores.filter((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, stores]);

  useEffect(() => {
    if (stage === "select-customer" && selectedStore) {
      const fetchCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
          const token = localStorage.getItem("accessToken");
          if (!token) return;
          const result = await getCustomers(token);
          if (result.success && result.data) {
            setCustomers(result.data);
          } else {
            toast.error("Failed to load customers");
          }
        } catch (err) {
          toast.error("Network error");
        } finally {
          setIsLoadingCustomers(false);
        }
      };
      fetchCustomers();
    }
  }, [stage, selectedStore]);

  useEffect(() => {
    if (stage === "invoice" && selectedStore) {
      const fetchStock = async () => {
        setIsLoadingStock(true);
        try {
          const token = localStorage.getItem("accessToken");
          if (!token) return;
          const result = await getStoreStock(token, selectedStore.id);
          if (result.success && result.data) {
            setStoreStock(result.data);
          } else {
            toast.error("Failed to load store stock");
          }
        } catch (err) {
          toast.error("Network error loading stock");
        } finally {
          setIsLoadingStock(false);
        }
      };
      fetchStock();
    }
  }, [stage, selectedStore]);

  useEffect(() => {
    if (stage === "invoice" && selectedStore?.address) {
      const addr = selectedStore.address;
      const display = addr.name || `Lat: ${addr.lat}, Lng: ${addr.lng}`;
      invoiceForm.setValue("store_address", display);
    }
  }, [selectedStore, stage, invoiceForm]);

  useEffect(() => {
    const stockId = invoiceForm.getValues("stock_id");
    if (stockId) {
      const stockItem = storeStock.find((s) => s.id === stockId);
      if (stockItem) {
        invoiceForm.setValue("price", stockItem.selling_price);
        setSelectedStockItem(stockItem);
        setIsPriceEditable(false);
      }
    }
  }, [invoiceForm.watch("stock_id"), storeStock]);

  const handleOpenEmptiesModal = () => {
    setShowEmptiesModal(true);
  };

  const addItemToInvoice = () => {
    const values = invoiceForm.getValues();
    if (!values.stock_id || !values.quantity) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    const quantity = parseFloat(values.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const stockItem = storeStock.find((s) => s.id === values.stock_id);
    if (!stockItem) return;

    const price = parseFloat(values.price || "0");
    const discount = parseFloat(values.discounted_amount || "0");
    const emptiesQty = parseFloat(values.empties_quantity || "0");
    const emptiesPrice = parseFloat(stockItem.empties_price || "0");

    const perUnitPayable = price - discount;
    const totalPayable = perUnitPayable * quantity + emptiesQty * emptiesPrice;

    const newItem: InvoiceItem = {
      stock_id: values.stock_id,
      product_name: stockItem.product.name,
      sku: stockItem.sku,
      product_image: stockItem.product.image,
      quantity: quantity,
      mode: values.mode as "PACKS" | "PIECES",
      price: price,
      discounted_amount: discount,
      payable_amount: totalPayable,
      empties: values.empties_type
        ? {
            type: values.empties_type as "CREDIT" | "SELL",
            quantity: emptiesQty,
          }
        : undefined,
    };

    setInvoiceItems((prev) => [...prev, newItem]);
    toast.success("Item added to invoice");

    invoiceForm.reset({
      stock_id: "",
      quantity: "1",
      delivery: false,
      mode: "PACKS",
      discounted_amount: "0",
      empties_type: "",
      empties_quantity: "",
      store_address: invoiceForm.getValues("store_address"),
      price: "",
      payable_amount: "",
    });
    setSelectedStockItem(null);
    setIsPriceEditable(false);
    setEmptiesQuantityInput("");
  };

  const submitInvoice = async () => {
    if (invoiceItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    setIsSubmittingInvoice(true);

    const storeAddress = selectedStore?.address || null;

    const payload = {
      customer_id: isWalkIn ? null : selectedCustomer?.id || null,
      store_id: selectedStore!.id,
      items: invoiceItems.map((item) => ({
        stock_id: item.stock_id,
        quantity: item.quantity,
        // delivery: false, // Commented out as requested
        mode: item.mode,
        discounted_amount: item.discounted_amount,
        empties: item.empties,
        attributes: {
          latitude: storeAddress?.lat || 0,
          longitude: storeAddress?.lng || 0,
          address: storeAddress?.name || "",
        },
      })),
    };

    try {
      const response = await handleCreateInvoice(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Invoice created successfully!");

        const invoiceData = response.data;

        if (invoiceData?.id) {
          const previewData = {
            invoiceId: invoiceData.id,
            code: invoiceData.code,
            total: invoiceData.total,
            status: invoiceData.status,
            storeAddress:
              invoiceData.items[0]?.attributes?.address || "No address",
            items_count: invoiceData.items_count,
            items: invoiceData.items.map((item: any, index: number) => {
              const localItem = invoiceItems[index];

              return {
                id: item.id,
                stock_id: item.stock_id,
                product_id: item.product_id,
                quantity: item.quantity,
                cost: item.cost,
                discounted_amount: item.discounted_amount,
                sub_total: item.sub_total,
                mode: item.mode,
                attributes: item.attributes,
                sku: localItem?.sku || "N/A",
                product_name: localItem?.product_name || "Unknown Product",
                product_image: localItem?.product_image || "",
              };
            }),
          };

          localStorage.setItem(
            `invoice-preview-${invoiceData.id}`,
            JSON.stringify(previewData),
          );

          router.push(
            `/inventory/sell/pay?invoiceId=${invoiceData.id}`,
          );
        } else {
          toast.warning("Invoice created but no ID returned");
        }

        setInvoiceItems([]);
        setSelectedStore(null);
        setSelectedCustomer(null);
        setIsWalkIn(false);
        setCustomerOptionSelected(null);
        invoiceForm.reset();
      } else {
        toast.error(response.error || "Failed to create invoice");
      }
    } catch (err) {
      toast.error("Failed to create invoice");
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const onCreateCustomer = async (data: CustomerForm) => {
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        type: data.type,
        address: {
          latitude: data.address.latitude,
          longitude: data.address.longitude,
          address: data.address.address,
        },
      };

      const response = await handleCreateCustomer(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.msg || "Customer created successfully!");

        const closeButton = document.querySelector("[data-radix-dialog-close]");
        if (closeButton) (closeButton as HTMLElement).click();

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");
        if (token) {
          const result = await getCustomers(token);
          if (result.success && result.data) {
            setCustomers(result.data);
          }
        }

        customerForm.reset();
      } else {
        toast.error(response.error || "Failed to create customer");
      }
    } catch (err: any) {
      toast.error(err?.error || "Failed to create customer");
    }
  };

  const handleProceedFromStore = () => {
    if (!customerOptionSelected) {
      toast.error("Please select a customer option");
      return;
    }

    if (customerOptionSelected === "list") {
      setStage("select-customer");
    } else if (customerOptionSelected === "walk-in") {
      setIsWalkIn(true);
      setStage("invoice");
    }
  };

  // Calculate total payable amount
  const totalPayable = invoiceItems.reduce(
    (sum, item) => sum + item.payable_amount,
    0,
  );

  if (stage === "select-store") {
    return (
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Sell
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Sell your stock to a customer
        </p>

        <div className="md:mt-8 flex flex-col lg:flex-row gap-4">
          <div className="py-3 md:py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg w-full lg:w-[35%] bg-white">
            <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
              Select the store you want to sell from
            </h1>
            <Separator
              orientation="horizontal"
              className="h-[1px] mt-3"
              style={{ background: "#E0E0E0" }}
            />

            <div className="mt-6">
              {isLoadingStores ? (
                <div className="flex items-center gap-2 justify-center py-4">
                  <p className="text-center text-gray-500">Loading stores...</p>
                  <ThreeDots
                    height="40"
                    width="40"
                    color="#0A6DC0"
                    visible={true}
                  />
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-red-500">{error}</p>
                  <button
                    className="mt-2 bg-[#0A6DC0] hover:bg-[#085a9e] rounded-lg px-4 py-2 text-white"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : filteredStores.length === 0 ? (
                <p className="text-center py-4 text-gray-500">
                  No stores found
                </p>
              ) : (
                <>
                  <div className="hidden lg:block space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredStores.map((store) => (
                      <div
                        key={store.id}
                        onClick={() => setSelectedStore(store)}
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
                      </div>
                    ))}
                  </div>
                  <div className="lg:hidden">
                    <Select
                      value={selectedStore?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const store = filteredStores.find(
                          (s) => s.id === value,
                        );
                        if (store) setSelectedStore(store);
                      }}
                      disabled={isLoadingStores || !!error}
                    >
                      <SelectTrigger className="w-full h-12 border rounded px-3">
                        <SelectValue placeholder="Select a store" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg w-full lg:w-[65%] bg-white">
            <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
              {selectedStore ? selectedStore.name : "Select a store"}
            </h1>
            <p className="text-[#9E9A9A] font-dm-sans">
              Select or create the customer you want to sell to
            </p>
            <Separator
              orientation="horizontal"
              className="h-[1px] mt-3"
              style={{ background: "#E0E0E0" }}
            />

            <div className="mt-5 space-y-4">
              <button
                onClick={() => setCustomerOptionSelected("list")}
                disabled={!selectedStore}
                className={`w-full h-14 border rounded-lg flex items-center gap-3 px-4 transition-colors ${
                  customerOptionSelected === "list"
                    ? "border-[#0A6DC0] bg-[#0A6DC0]/10"
                    : "border-[#D8D8D866] hover:bg-gray-50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <UserRound className="w-5 h-5" />
                <p>Select from customer list</p>
              </button>

              <button
                onClick={() => setCustomerOptionSelected("walk-in")}
                disabled={!selectedStore}
                className={`w-full h-14 border rounded-lg flex items-center gap-3 px-4 transition-colors ${
                  customerOptionSelected === "walk-in"
                    ? "border-[#0A6DC0] bg-[#0A6DC0]/10"
                    : "border-[#D8D8D866] hover:bg-gray-50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <UserRound className="w-5 h-5" />
                <p>Walk-in Customer</p>
              </button>

              <Button
                onClick={handleProceedFromStore}
                disabled={!selectedStore || !customerOptionSelected}
                className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] h-12"
              >
                Proceed
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "select-customer") {
    return (
      <div>
        <button
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          onClick={() => setStage("select-store")}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Customer
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Sell to the customer you want to sell to
        </p>

        <div className="py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg mt-8 bg-white">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-[#2F2F2F] font-clash">
              Select Customer
            </h2>
            <button
              onClick={() => setStage("select-store")}
              className="text-[#0A6DC0]"
            >
              Change Store
            </button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="font-bold font-dm-sans text-[#0A6DC0] border-b mb-5 border-[#0A6DC0]">
                + Add a new Customer
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex font-clash justify-between items-center">
                  Create New Customer
                  <AlertDialogCancel className="border-0 bg-transparent p-0">
                    <X className="w-5 h-5" />
                  </AlertDialogCancel>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left">
                  Fill in the necessary details to create a new customer
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Form {...customerForm}>
                <form
                  onSubmit={customerForm.handleSubmit(onCreateCustomer)}
                  className="space-y-4"
                >
                  <FormField
                    control={customerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter name"
                            {...field}
                            className="bg-[#D8D8D866] h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter email"
                              {...field}
                              className="pl-10 bg-[#D8D8D866] h-12"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            country="ng"
                            value={field.value}
                            onChange={field.onChange}
                            inputStyle={{
                              width: "100%",
                              height: "48px",
                              backgroundColor: "#D8D8D866",
                              border: "none",
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Type</FormLabel>
                        <select
                          {...field}
                          className="w-full h-12 border rounded px-3 bg-[#D8D8D866]"
                        >
                          <option value="">Select type</option>
                          <option value="Distributor">Distributor</option>
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Retailer">Retailer</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <PlacesAutocompleteInput
                            placeholder="Enter full business address"
                            value={field.value?.address || ""}
                            onChange={(addressData) => {
                              if (typeof addressData === "string") {
                                field.onChange({
                                  address: addressData,
                                  latitude: field.value?.latitude || 0,
                                  longitude: field.value?.longitude || 0,
                                });
                              } else {
                                field.onChange({
                                  address: addressData.name,
                                  latitude: addressData.lat,
                                  longitude: addressData.lng,
                                });
                              }
                            }}
                            className="bg-[#D8D8D866] h-12 border-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      type="submit"
                      disabled={customerForm.formState.isSubmitting}
                      className="bg-[#0A6DC0] hover:bg-[#09599a]"
                    >
                      {customerForm.formState.isSubmitting ? (
                        <>
                          Creating...{" "}
                          <ClipLoader
                            size={18}
                            color="white"
                            className="ml-2"
                          />
                        </>
                      ) : (
                        "Create Customer"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>

          {isLoadingCustomers ? (
            <div className="flex items-center gap-2 justify-center">
              <p className="text-center py-4 text-gray-500">
                Loading Customers...
              </p>
              <ThreeDots
                height="40"
                width="40"
                color="#0A6DC0"
                visible={true}
              />
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setStage("invoice");
                  }}
                  className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? "border-[#0A6DC0] bg-[#0A6DC0]/10"
                      : "border-[#D8D8D866]"
                  }`}
                >
                  <UserRound />
                  <div>
                    <p className="font-medium font-dm-sans text-[#2F2F2F]">
                      {customer.name}
                    </p>
                    <p className="text-sm text-[#2F2F2F] font-regular text-[13px]">
                      {customer.phone} • {customer.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === "invoice") {
    return (
      <div>
        <div className="flex gap-4 mb-6">
          <button
            className="flex items-center  text-gray-600 hover:text-gray-900 font-medium"
            onClick={() => setStage("select-store")}
          >
            <ArrowLeft size={20} />
            Change Store
          </button>

          <button
            className="flex items-center  text-gray-600 hover:text-gray-900 font-medium"
            onClick={() => setStage("select-customer")}
          >
            <ArrowLeft size={20} />
            Change Customer
          </button>
        </div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Create Invoice
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Kindly fill the details below to create invoice
        </p>

        <div className="py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg md:mt-8 bg-white">
          <div className="mb-2 flex items-center justify-between font-dm-sans font-medium">
            <p className="text-[16px] text-[#000000] ">Store</p>
            <button
              onClick={() => {
                setStage("select-store");
                setCustomerOptionSelected(null);
                setIsWalkIn(false);
              }}
              className="text-[#0A6DC0]"
            >
              Change Store
            </button>
          </div>
          <div className="py-3 mb-4 px-5 flex items-center gap-2 font-dm-sans border border-[#0A6DC0] bg-[#0A6DC012] rounded-lg">
            <Image src={"/store.svg"} alt="store" width={30} height={30} />
            <div>
              <p className="text-[#2F2F2F] font-medium">
                {selectedStore?.name}
              </p>
              <div className="flex items-center gap-2 text-[13px]">
                <p className="text-[#2F2F2F] font-medium">
                  Inventory value: ₦{" "}
                </p>
                <p className="text-[#9E9A9A]">{selectedStore?.stock_value}</p>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <p className="text-[#2F2F2F] font-medium">Product Count:</p>
                <p className="text-[#9E9A9A]">{selectedStore?.stock_count}</p>
              </div>
            </div>
          </div>

          <Form {...invoiceForm}>
            <form className="space-y-6 mb-2">
              <div className="grid md:grid-cols-2 gap-5">
                <FormField
                  control={invoiceForm.control}
                  name="stock_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-12 bg-[#F9F9F9] border border-[#D8D8D866]"
                            disabled={isLoadingStock || storeStock.length === 0}
                          >
                            {field.value ? (
                              (() => {
                                const selected = storeStock.find(
                                  (s) => s.id === field.value,
                                );
                                return selected ? (
                                  <div className="flex items-center gap-3 truncate">
                                    {selected.product.image && (
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
                                        {selected.product.name}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  "Select product..."
                                );
                              })()
                            ) : isLoadingStock ? (
                              <span className="text-gray-400">
                                Loading stock...
                              </span>
                            ) : storeStock.length === 0 ? (
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
                                {isLoadingStock ? (
                                  <ClipLoader size={24} color="#0A6DC0" />
                                ) : (
                                  "No product found."
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {storeStock.map((stock) => (
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
                                        {stock.product.image ? (
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
                                            {stock.product.name}
                                          </span>
                                          <span className="text-xs text-gray-500 truncate">
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
                          placeholder="e.g. 1 or 0.5"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow numbers with decimals, but prevent just "0" or "0."
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              field.onChange(value);
                            }
                          }}
                          className="bg-[#F9F9F9] h-12 border border-[#D8D8D866]"
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
                        <div className="flex flex-wrap gap-6 items-center">
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
                      <FormLabel>Discount per Unit</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3.5 text-gray-500">
                            ₦
                          </span>
                          <Input
                            placeholder="e.g. 20"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                field.onChange(value);
                              }
                            }}
                            className="bg-[#F9F9F9] h-12 border border-[#D8D8D866] pl-8"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500">
                      ₦
                    </span>
                    <Input
                      value={invoiceForm.getValues("price")}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          invoiceForm.setValue("price", value);
                        }
                      }}
                      readOnly={true}
                      className="bg-[#F9F9F9] h-12 border border-[#D8D8D866] pl-8 pr-10 cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={handleOpenPriceEditModal}
                      className="absolute right-3 top-3 text-[#0A6DC0] hover:text-[#085a9e]"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* <FormField
                  control={invoiceForm.control}
                  name="store_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-[#F9F9F9] h-12 border border-[#D8D8D866] cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <div className="space-y-2">
                  <Label>Empties Quantity</Label>
                  <Input
                    placeholder="e.g. 3 or 2.5"
                    value={invoiceForm.getValues("empties_quantity")}
                    onClick={handleOpenEmptiesModal}
                    readOnly
                    className="bg-[#F9F9F9] h-12 border border-[#D8D8D866] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount Payable</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-500">
                    ₦
                  </span>
                  <Input
                    type="text"
                    value={formatCurrency(
                      parseFloat(
                        invoiceForm.getValues("payable_amount") || "0",
                      ),
                    )}
                    readOnly
                    className="bg-[#F9F9F9] h-12 w-full border border-[#D8D8D866] cursor-not-allowed pl-8"
                  />
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

        <Card className="mt-5 md:px-6 pb-6">
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
                        Payable
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
                          {item.sku}
                        </td>
                        <td className="py-4">{item.quantity}</td>
                        <td className="py-4 lowercase">{item.mode}</td>
                        <td className="py-4">
                          ₦{formatCurrency(item.discounted_amount)}
                        </td>
                        <td className="py-4 font-semibold text-[#0A6DC0]">
                          ₦{formatCurrency(item.payable_amount)}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => {
                              setInvoiceItems((prev) =>
                                prev.filter((_, index) => index !== i),
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
            onClick={submitInvoice}
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

        <Dialog open={showEmptiesModal} onOpenChange={setShowEmptiesModal}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="font-clash">
                How are you selling?
              </DialogTitle>
              <DialogDescription>
                How would you like to sell your empties?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="empties-quantity">Empties Quantity</Label>
                <Input
                  id="empties-quantity"
                  placeholder="Enter quantity (e.g. 3 or 2.5)"
                  value={emptiesQuantityInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setEmptiesQuantityInput(value);
                    }
                  }}
                  className="h-12 bg-[#FAFAFA]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empties-price">Empties Price</Label>
                <Input
                  id="empties-price"
                  value={
                    selectedStockItem?.empties_price
                      ? `₦${selectedStockItem.empties_price}`
                      : "No empties price available"
                  }
                  readOnly
                  className="bg-[#FAFAFA] cursor-not-allowed h-12"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmptiesModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  invoiceForm.setValue(
                    "empties_quantity",
                    emptiesQuantityInput,
                  );
                  setShowEmptiesModal(false);
                }}
                className="bg-[#0A6DC0] hover:bg-[#085a9e]"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EditStockPriceModal
          isOpen={isEditPriceModalOpen}
          onClose={() => setIsEditPriceModalOpen(false)}
          stockId={selectedStockItem?.id || ""}
          currentPrices={currentStockPrices}
          onSuccess={handlePriceUpdateSuccess}
        />
      </div>
    );
  }

  return null;
};

export default Sell;
