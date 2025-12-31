"use client";

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
import { Mail, Search } from "lucide-react";
import { getStores } from "@/actions/stores";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
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
import { Separator } from "@radix-ui/react-separator";

interface StoreType {
  id: string;
  name: string;
}

const Sell = () => {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedStoreName =
    stores.find((store) => store.id === selectedStore)?.name || "";

  // Fetch stores on component mount
  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");

        if (!token) {
          setError("Please log in to view stores");
          setIsLoading(false);
          return;
        }

        const result = await getStores(token);

        if (result.success && result.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const storeNames = result.data.map((store: any) => ({
            id: store.id,
            name: store.name,
          }));
          setStores(storeNames);
          setFilteredStores(storeNames);
        } else {
          setError(result.error || "Failed to load stores");
        }
      } catch (error) {
        console.error("Error loading stores:", error);
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  // Filter stores based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStores(stores);
    } else {
      const filtered = stores.filter((store) =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStores(filtered);
    }
  }, [searchTerm, stores]);

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: undefined, // Important: use undefined, not empty string
      address: "",
    },
  });

  const onSubmit = async (data: CustomerForm) => {
    console.log("Customer data:", data);
    // TODO: Add API call here
  };

  return (
    <div>
      <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
        Sell
      </h1>
      <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
        Sell your stock to a customer
      </p>
      <div className="mt-8 flex flex-col lg:flex-row gap-2 lg:gap-4 min-h-screen">
        <Card className="py-6 px-4 w-full lg:w-[35%] bg-white">
          <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
            Select the store you want to sell from
          </h1>
          <Separator
            orientation="horizontal"
            className="h-[1px] mt-3"
            style={{ background: "#E0E0E0" }}
          />

          {/* Search Input */}
          <div className="relative mt-6">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Type to search"
              className="lg:w-[329px] pl-10 bg-transparent border-2 border-[#E7EBED]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || !!error}
            />
          </div>

          {/* Stores List */}
          <div className="mt-6 space-y-2">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading stores...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  {searchTerm ? "No stores found" : "No stores available"}
                </p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store.id)}
                  className={`border rounded-lg px-3 py-4 cursor-pointer transition-colors ${
                    selectedStore === store.id
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

        <Card className="py-6 px-4 w-full lg:w-[70%] bg-white">
          <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
            {selectedStore ? selectedStoreName : "Select a store"}
          </h1>
          <p className="text-[#9E9A9A] font-dm-sans">
            Select or create the customer you want to sell to
          </p>
          <Separator
            orientation="horizontal"
            className="h-[1px] mt-3"
            style={{ background: "#E0E0E0" }}
          />
          <AlertDialog>
            <AlertDialogTrigger className="font-bold font-dm-sans text-[#0A6DC0] mt-4">
              + Add a new Customer
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-clash text-[20px] md:text-[25px] text-[#2F2F2F]">
                  Create New Customer
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[16px] font-dm-sans font-medium text-[#9E9A9A]">
                  Fill in the necessary details to create a new customer
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2F2F2F] font-medium font-dm-sans text-[16px]">
                          Customer Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter customer name"
                            {...field}
                            className="bg-[#D8D8D866] h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2F2F2F] font-dm-sans font-medium text-[16px]">
                          Email
                        </FormLabel>
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

                  {/* Phone Field */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2F2F2F] font-dm-sans font-medium text-[16px]">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            country={"ng"}
                            value={field.value}
                            onChange={field.onChange}
                            inputStyle={{
                              width: "100%",
                              height: "48px",
                              backgroundColor: "#D8D8D866",
                              borderRadius: "8px",
                              border: "none",
                            }}
                            containerStyle={{ width: "100%" }}
                            buttonStyle={{ borderRadius: "8px 0 0 8px" }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Customer Type Select - FIXED */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2F2F2F] font-dm-sans font-medium text-[16px]">
                          Customer Type
                        </FormLabel>
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
                            <SelectItem value="Retailer">Retailer</SelectItem>
                            <SelectItem value="wholesaler">Wholesaler</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Field */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2F2F2F] font-dm-sans font-medium text-[16px]">
                          Address
                        </FormLabel>
                        <FormControl>
                          <PlacesAutocompleteInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter full business address"
                            className="bg-[#D8D8D866] h-12 border-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AlertDialogFooter>
                    <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={form.handleSubmit(onSubmit)}
                      className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
                    >
                      Create Customer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </div>
  );
};

export default Sell;