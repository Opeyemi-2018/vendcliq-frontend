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
import { Mail, Search, Trash2, UserRound, X } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface StoreType {
  id: string;
  name: string;
  stock_value: string;
  stock_count: string;
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
  product: {
    name: string;
    image: string;
  };
}

interface InvoiceItem {
  stock_id: string;
  product_name: string;
  quantity: number;
  mode: "PACKS" | "PIECES";
  discounted_amount: number;
  empties?: { type: "CREDIT" | "SELL"; quantity: number };
}

const Sell = () => {
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
    null
  );
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [customerOptionSelected, setCustomerOptionSelected] = useState<
    "list" | "walk-in" | null
  >(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [storeStock, setStoreStock] = useState<StockItem[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  const customerForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: undefined,
      address: {
        address: "",
        latitude: 0,
        longitude: 0,
      },
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
    },
  });

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      setIsLoadingStores(true);
      setError(null);
      try {
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");
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

  // Filter stores
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredStores(stores);
    } else {
      setFilteredStores(
        stores.filter((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, stores]);

  // Fetch customers
  useEffect(() => {
    if (stage === "select-customer" && selectedStore) {
      const fetchCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken");
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

  // Fetch stock for selected store when entering invoice stage
  useEffect(() => {
    if (stage === "invoice" && selectedStore) {
      const fetchStock = async () => {
        setIsLoadingStock(true);
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken");
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

  const addItemToInvoice = () => {
    const values = invoiceForm.getValues();

    if (!values.stock_id || !values.quantity) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    const stockItem = storeStock.find((s) => s.id === values.stock_id);
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
      delivery: false,
      mode: "PACKS",
      discounted_amount: "",
      empties_type: "",
      empties_quantity: "",
    });
  };

  const submitInvoice = async () => {
    if (invoiceItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    setIsSubmittingInvoice(true);

    const payload = {
      customer_id: isWalkIn ? null : selectedCustomer?.id || null,
      store_id: selectedStore!.id,
      items: invoiceItems.map((item) => ({
        stock_id: item.stock_id,
        quantity: item.quantity,
        delivery: false,
        mode: item.mode,
        discounted_amount: item.discounted_amount,
        empties: item.empties,
        attributes: isWalkIn
          ? {}
          : { address: selectedCustomer?.address || "" },
      })),
    };

    try {
      const response = await handleCreateInvoice(payload);
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Invoice created successfully!");
        setInvoiceItems([]);
        setStage("select-store");
        setSelectedStore(null);
        setSelectedCustomer(null);
        setIsWalkIn(false);
        setCustomerOptionSelected(null);
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

  // Stage 1: Select Store + Customer Options
  if (stage === "select-store") {
    return (
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Sell
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Sell your stock to a customer
        </p>

        <div className="mt-8 flex flex-col lg:flex-row gap-4">
          {/* Left Card - Store Selection */}
          <Card className="py-6 px-4 w-full lg:w-[35%] bg-white">
            <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
              Select the store you want to sell from
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <p className="text-center py-4 text-gray-500">
                  No stores found
                </p>
              ) : (
                filteredStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`border rounded-lg px-3 py-4 cursor-pointer transition-colors ${
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
                ))
              )}
            </div>
          </Card>

          {/* Right Card - Customer Options */}
          <Card className="py-6 px-4 w-full lg:w-[70%] bg-white">
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
          </Card>
        </div>
      </div>
    );
  }

  // Stage 2: Select Customer
  if (stage === "select-customer") {
    return (
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Customer
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Sell the customer that you want to sell to
        </p>

        <Card className="py-6 px-4 mt-8 bg-white">
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#D8D8D866] h-12">
                              <SelectValue placeholder="Select customer type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Distributor">
                              Distributor
                            </SelectItem>
                            <SelectItem value="Wholesaler">
                              Wholesaler
                            </SelectItem>
                            <SelectItem value="Retailer">Retailer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2F2F2F] font-dm-sans font-medium text-[16px]">
                          Address
                        </FormLabel>
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
                      type="button"
                      onClick={() =>
                        customerForm.handleSubmit(onCreateCustomer)()
                      }
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
                  onClick={() => setSelectedCustomer(customer)}
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

          <Button
            className="w-full mt-8 bg-[#0A6DC0] hover:bg-[#085a9e] h-12"
            disabled={!selectedCustomer}
            onClick={() => setStage("invoice")}
          >
            Proceed with {selectedCustomer?.name || "selected customer"}
          </Button>
        </Card>
      </div>
    );
  }

  // Stage 3: Invoice Form
  if (stage === "invoice") {
    return (
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Create Invoicev
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          Kindly fill the details below to create invoice
        </p>

        <Card className="py-6 px-4 mt-8 bg-white">
          <div className="mb-2 flex items-center justify-between font-dm-sans font-medium">
            <p className="text-[16px]   text-[#000000] ">Store</p>
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
                <p className="text-[text-[#2F2F2F] font-medium]">
                  Inventory value: ₦{" "}
                </p>
                <p className="text-[#9E9A9A]">{selectedStore?.stock_value}</p>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <p className="text-[text-[#2F2F2F] font-medium]">
                  Product Count:
                </p>
                <p className="text-[#9E9A9A]">{selectedStore?.stock_count}</p>
              </div>
            </div>
          </div>

          <Form {...invoiceForm}>
            <form className="space-y-6  mb-2">
              <div className="grid grid-cols-2 gap-5">
                {/* SKU Selection from Store Stock */}
                <FormField
                  control={invoiceForm.control}
                  name="stock_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingStock}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#F3F4F6] h-12">
                            <SelectValue
                              placeholder={
                                isLoadingStock
                                  ? "Loading stock..."
                                  : "Choose SKU"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingStock ? (
                            <SelectItem value="loading" disabled>
                              Loading stock...
                            </SelectItem>
                          ) : storeStock.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              No stock available
                            </SelectItem>
                          ) : (
                            storeStock.map((stock) => (
                              <SelectItem key={stock.id} value={stock.id}>
                                <div className="flex gap-2 lowercase text-left">
                                  <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                    {stock.product.image && (
                                      <Image
                                        src={stock.product.image}
                                        alt={stock.sku}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover object-center"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{stock.sku}</p>
                                    <p className="text-sm text-gray-500">
                                      {stock.product.name}
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

                {/* Mode */}
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

                {/* Quantity */}
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

                {/* Empties Type */}
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
                          {/* Delivery checkbox inside empties row */}
                          <FormField
                            control={invoiceForm.control}
                            name="delivery"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="w-5 h-5 accent-[#0A6DC0]"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  Delivery required
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discounted Amount */}
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

                {/* Empties Quantity */}
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

        <Card className="mt-5 px-4 pb-6 ">
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
                        <td className="py-4 ">{item.quantity}</td>
                        <td className="py-4 lowercase ">{item.mode}</td>
                        <td className="py-4 ">₦{item.discounted_amount}</td>
                        <td className="py-4 ">
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
      </div>
    );
  }

  return null;
};

export default Sell;
