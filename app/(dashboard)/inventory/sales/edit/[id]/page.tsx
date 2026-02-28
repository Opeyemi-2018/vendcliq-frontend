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
} from "lucide-react";
import { getStores } from "@/actions/stores";
import { getCustomers } from "@/actions/getcustomers";
import { getStoreStock } from "@/actions/getUserStocks";
import { getSaleById } from "@/lib/utils/api/apiHelper";
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
  handleUpdateInvoice,
} from "@/lib/utils/api/apiHelper";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThreeDots } from "react-loader-spinner";
import { useRouter, useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpdateInvoicePayload } from "@/types/invoice";

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
  discounted_amount: number;
  empties?: { type: "CREDIT" | "SELL"; quantity: number };
}

const EditInvoice = () => {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [stage, setStage] = useState<
    "select-store" | "select-customer" | "invoice"
  >("invoice"); // ← changed to start directly here

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
      quantity: "",
      delivery: false,
      mode: "PACKS",
      discounted_amount: "",
      empties_type: "",
      empties_quantity: "",
      store_address: "",
      price: "",
    },
  });

  useEffect(() => {
    if (!invoiceId) {
      toast.error("No invoice ID");
      router.back();
      return;
    }

    const loadInvoice = async () => {
      setIsLoadingStores(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Please log in");
        setIsLoadingStores(false);
        return;
      }

      try {
        // 1. Get invoice
        const invRes = await getSaleById(invoiceId);
        if (invRes.statusCode !== 200 || !invRes.data) {
          throw new Error(invRes.error || "Failed to load invoice");
        }
        const inv = invRes.data;

        // 2. Get stores and pre-select the invoice's store
        const storesRes = await getStores(token);
        if (storesRes.success && storesRes.data) {
          const storeList = storesRes.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            stock_value: s.stock_value?.toLocaleString() || "0",
            stock_count: s.stock_count,
            address: s.address,
          }));
          setStores(storeList);
          setFilteredStores(storeList);

          const matchingStore = storeList.find(
            (s: any) => s.id === inv.store_id,
          );
          if (matchingStore) {
            setSelectedStore(matchingStore);
          }
        }

        const custRes = await getCustomers(token);
        if (custRes.success && custRes.data) {
          setCustomers(custRes.data);
          if (inv.customer_id) {
            const match = custRes.data.find(
              (c: any) => c.id === inv.customer_id,
            );
            if (match) setSelectedCustomer(match);
          } else {
            setIsWalkIn(true);
            setCustomerOptionSelected("walk-in");
          }
        }

        const prefilledItems: InvoiceItem[] = inv.items.map((it: any) => {
          const realStockId = it.stock?.id || String(it.stock_id || "");

          return {
            stock_id: realStockId,
            product_name: it.product?.name || "Unknown Product",
            sku: it.stock?.sku || "",
            product_image: it.product?.image || it.stock?.product?.image || "",
            quantity: Number(it.quantity) || 0,
            mode: it.mode || "PACKS",
            discounted_amount: Number(it.discounted_amount) || 0,
            empties: it.empties
              ? {
                  type: it.empties.type || "CREDIT",
                  quantity: it.empties.quantity || 0,
                }
              : undefined,
          };
        });
        setInvoiceItems(prefilledItems);
      } catch (err: any) {
        setError(err.message || "Failed to load invoice");
        toast.error("Could not load invoice for editing");
      } finally {
        setIsLoadingStores(false);
      }
    };

    loadInvoice();
  }, [invoiceId, router]);

  // Load stock when store is selected (or pre-selected)
  useEffect(() => {
    if (selectedStore && stage === "invoice") {
      const fetchStock = async () => {
        setIsLoadingStock(true);
        try {
          const token = localStorage.getItem("accessToken");
          if (!token) return;
          const res = await getStoreStock(token, selectedStore.id);
          if (res.success && res.data) {
            setStoreStock(res.data);
          } else {
            toast.error("Failed to load stock");
          }
        } catch {
          toast.error("Network error loading stock");
        } finally {
          setIsLoadingStock(false);
        }
      };
      fetchStock();
    }
  }, [selectedStore, stage]);

  // Store address display
  useEffect(() => {
    if (selectedStore?.address && stage === "invoice") {
      const addr = selectedStore.address;
      invoiceForm.setValue(
        "store_address",
        addr.name || `Lat: ${addr.lat}, Lng: ${addr.lng}`,
      );
    }
  }, [selectedStore, stage, invoiceForm]);

  // Price preview
  useEffect(() => {
    const stockId = invoiceForm.getValues("stock_id");
    if (stockId && stage === "invoice") {
      const item = storeStock.find((s) => s.id === stockId);
      if (item) {
        invoiceForm.setValue("price", item.selling_price);
        setSelectedStockItem(item);
      }
    }
  }, [invoiceForm.watch("stock_id"), storeStock, stage, invoiceForm]);

  const handleOpenEmptiesModal = () => setShowEmptiesModal(true);

  const addItemToInvoice = () => {
    const values = invoiceForm.getValues();
    if (!values.stock_id || !values.quantity) {
      toast.error("Select product and quantity");
      return;
    }
    const stock = storeStock.find((s) => s.id === values.stock_id);
    if (!stock) return;

    const newItem: InvoiceItem = {
      stock_id: values.stock_id,
      product_name: stock.product.name,
      sku: stock.sku,
      product_image: stock.product.image,
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
    toast.success("Item added");

    invoiceForm.reset({
      stock_id: "",
      quantity: "",
      delivery: false,
      mode: "PACKS",
      discounted_amount: "",
      empties_type: "",
      empties_quantity: "",
      store_address: invoiceForm.getValues("store_address"),
      price: "",
    });
    setSelectedStockItem(null);
  };

  const submitInvoice = async () => {
    if (invoiceItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    setIsSubmittingInvoice(true);

    const payload: UpdateInvoicePayload = {
      customer_id: isWalkIn ? null : selectedCustomer?.id || null,
      store_id: selectedStore!.id,
      items: invoiceItems.map((item) => ({
        stock_id: String(item.stock_id).trim(),
        quantity: item.quantity,
        delivery: false,
        mode: item.mode,
        discounted_amount: item.discounted_amount,
        empties: item.empties,
        attributes: {
          latitude: selectedStore?.address?.lat || 0,
          longitude: selectedStore?.address?.lng || 0,
          address: selectedStore?.address?.name || "",
        },
      })),
    };

    console.log("Update payload being sent:", JSON.stringify(payload, null, 2));

    try {
      const response = await handleUpdateInvoice(invoiceId, payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Invoice updated!");

        const data = response.data;
        if (data?.id) {
          const preview = {
            invoiceId: data.id,
            code: data.code,
            total: data.total,
            status: data.status,
            storeAddress: data.items?.[0]?.attributes?.address || "No address",
            items: data.items.map((it: any, idx: number) => {
              const local = invoiceItems[idx];
              return {
                id: it.id,
                stock_id: it.stock_id,
                product_id: it.product_id,
                quantity: it.quantity,
                cost: it.cost,
                discounted_amount: it.discounted_amount,
                sub_total: it.sub_total,
                mode: it.mode,
                attributes: it.attributes,
                sku: local?.sku || "N/A",
                product_name: local?.product_name || "Unknown",
                product_image: local?.product_image || "",
              };
            }),
          };

          localStorage.setItem(
            `invoice-preview-${data.id}`,
            JSON.stringify(preview),
          );
          router.push(`/inventory/sell/pay?invoiceId=${data.id}`);
        } else {
          router.push(`/inventory/sales/${invoiceId}`);
        }

        // Cleanup
        setInvoiceItems([]);
        setSelectedStore(null);
        setSelectedCustomer(null);
        setIsWalkIn(false);
        setCustomerOptionSelected(null);
        invoiceForm.reset();
      } else {
        toast.error(response.error || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating invoice");
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

      const res = await handleCreateCustomer(payload);
      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success("Customer created");

        const close = document.querySelector("[data-radix-dialog-close]");
        if (close) (close as HTMLElement).click();

        const token = localStorage.getItem("accessToken");
        if (token) {
          const custRes = await getCustomers(token);
          if (custRes.success && custRes.data) setCustomers(custRes.data);
        }

        customerForm.reset();
      } else {
        toast.error(res.error || "Failed to create customer");
      }
    } catch (err: any) {
      toast.error(err.message || "Customer creation error");
    }
  };

  const handleProceedFromStore = () => {
    if (!customerOptionSelected) {
      toast.error("Select customer option");
      return;
    }
    if (customerOptionSelected === "list") {
      setStage("select-customer");
    } else {
      setIsWalkIn(true);
      setStage("invoice");
    }
  };

  // ── Render ──

  if (stage === "select-store") {
    return (
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Edit Invoice
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          First, select or change the store
        </p>

        <div className="md:mt-8 flex flex-col lg:flex-row gap-4">
          <div className="py-3 md:py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg w-full lg:w-[35%] bg-white">
            <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
              Select / Change Store
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
                  <p className="text-red-500">check your connection or retry</p>
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
                            ? "bg-[#0A6DC012] border-[#0A6DC0]"
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
                    <select
                      value={selectedStore?.id?.toString() || ""}
                      onChange={(e) => {
                        const store = filteredStores.find(
                          (s) => s.id === e.target.value,
                        );
                        if (store) setSelectedStore(store);
                      }}
                      className="w-full h-12 border rounded px-3"
                      disabled={isLoadingStores || !!error}
                    >
                      <option value="">Select a store</option>
                      {filteredStores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
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
              Select or create the customer
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
          Update or select customer for this invoice
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

  // ── Invoice stage ──
  if (stage === "invoice") {
    return (
      <div>
        {/* Added change links */}
        <div className="flex  gap-4 mb-6">
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
          Edit Invoice
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Update the invoice details below
        </p>

        <div className="py-6 md:p-6 lg:border border-[#E4E4E4] rounded-lg md:mt-8 bg-white">
          <div className="mb-2 flex items-center justify-between font-dm-sans font-medium">
            <p className="text-[16px] text-[#000000]">Store</p>
            <button
              onClick={() => setStage("select-store")}
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
                <p className="text-[#2F2F2F] font-medium">Inventory value: ₦</p>
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
                      <FormLabel>SKU / Product</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-12 bg-[#F3F4F6] border-none"
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
                                {isLoadingStock
                                  ? "Loading..."
                                  : "No product found."}
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
                                          <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
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
                                            ₦{stock.selling_price}
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

                          <FormField
                            control={invoiceForm.control}
                            name="delivery"
                            render={({ field }) => (
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-5 h-5 accent-[#0A6DC0]"
                                />
                                <label className="font-normal cursor-pointer">
                                  Delivery required
                                </label>
                              </div>
                            )}
                          />
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

                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={invoiceForm.getValues("price")}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed h-12"
                  />
                </div>

                <FormField
                  control={invoiceForm.control}
                  name="store_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-gray-100 cursor-not-allowed h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Empties Quantity</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 3"
                    value={invoiceForm.getValues("empties_quantity")}
                    onClick={handleOpenEmptiesModal}
                    readOnly
                    className="bg-white h-12 cursor-pointer"
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
                        <td className="py-4">₦{item.discounted_amount}</td>
                        <td className="py-4">
                          <button
                            onClick={() => {
                              setInvoiceItems((prev) =>
                                prev.filter((_, index) => index !== i),
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
                Updating Invoice...{" "}
                <ClipLoader size={20} color="white" className="ml-2" />
              </>
            ) : (
              "Update Invoice"
            )}
          </Button>
        </Card>

        {/* Empties Modal */}
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter quantity"
                  value={emptiesQuantityInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setEmptiesQuantityInput(value);
                  }}
                  className="h-12 bg-[#FAFAFA] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
      </div>
    );
  }

  return null;
};

export default EditInvoice;
