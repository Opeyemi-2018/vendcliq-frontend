/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomerForm, customerSchema } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Mail, Search, X, Plus, MoveRight, MoveLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCustomers } from "@/actions/getcustomers";
import { handleCreateCustomer } from "@/lib/utils/api/apiHelper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipLoader } from "react-spinners";
import { ThreeDots } from "react-loader-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PhoneInput from "react-phone-input-2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PlacesAutocompleteInput from "@/hooks/googleMap";
import { Label } from "@/components/ui/label";

interface CustomerType {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  address: {
    address: string;
    latitude: number;
    longitude: number;
  };
  totalSales: number;
  customer_empties: any[]; // adjust type if you have a proper interface
}

const Customer = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(
    null,
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  useEffect(() => {
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
      } catch (err: any) {
        toast.error(err);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

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

        // Close modal automatically after success
        const closeButton = document.querySelector("[data-radix-dialog-close]");
        if (closeButton) (closeButton as HTMLElement).click();

        // Refresh list
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

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email} ${customer.type} ${
      customer.address?.address || ""
    }`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination logic
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 ${
            currentPage === i
              ? "bg-[#0A6DC0] text-white hover:bg-[#0A6DC0]"
              : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      );
    }

    return pages;
  };

  return (
    <div>
      <div className="flex md:items-center justify-between gap-3 md:gap-0 flex-col md:flex-row mb-6">
        <div>
          <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
            Customer List
          </h1>
          <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
            View your customers list, track your sales and owed empties.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#0A6DC0] hover:bg-[#09599a] text-white flex items-center gap-2 px-6 py-5 md:py-6">
              <Plus size={18} />
              Add New Customer
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex font-clash justify-between items-center">
                Create New Customer
                <DialogTrigger asChild>
                  <X className="w-5 h-5 cursor-pointer" />
                </DialogTrigger>
              </DialogTitle>
              <DialogDescription className="text-left">
                Fill in the necessary details to create a new customer
              </DialogDescription>
            </DialogHeader>

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
                          <SelectItem value="Wholesaler">Wholesaler</SelectItem>
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

                <DialogFooter className="mt-6">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button
                    type="submit"
                    disabled={customerForm.formState.isSubmitting}
                    className="bg-[#0A6DC0] hover:bg-[#09599a]"
                  >
                    {customerForm.formState.isSubmitting ? (
                      <>
                        Creating...{" "}
                        <ClipLoader size={18} color="white" className="ml-2" />
                      </>
                    ) : (
                      "Create Customer"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative my-6">
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-[#313131]" />
        <Input
          placeholder="Search customers..."
          className="bg-[#F2F2F7] pl-10 py-6"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mt-3 lg:border bg-white border-[#E4E4E4] rounded-lg py-5 relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#E6E6E6]">
              <tr>
                <th className="text-left pl-4 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Name
                </th>
                <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Phone
                </th>
                <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Email
                </th>
                <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Type
                </th>
                <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Address
                </th>
                <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoadingCustomers ? (
                <tr>
                  <td colSpan={6} className="py-20 px-4">
                    <div className="flex flex-col items-center justify-center">
                      <ThreeDots
                        height="80"
                        width="80"
                        color="#0A6DC0"
                        visible={true}
                      />
                      <p className="mt-4 text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                        Loading customers...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 px-4">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                        {searchQuery
                          ? "No matching customers"
                          : "No customers found"}
                      </p>
                      <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                        {searchQuery
                          ? "Try a different search term"
                          : "Your customers will appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800/50 transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                  >
                    <td className="py-4 pl-4 font-medium">{customer.name}</td>
                    <td className="hidden md:table-cell py-4">
                      {customer.phone}
                    </td>
                    <td className="hidden md:table-cell py-4">
                      {customer.email}
                    </td>
                    <td className="hidden md:table-cell py-4">
                      {customer.type}
                    </td>
                    <td className="hidden md:table-cell py-4">
                      {customer.address?.address}
                    </td>
                    <td className="py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#0A6DC0] hover:text-[#09599a]"
                      >
                        <MoveRight size={18} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoadingCustomers && filteredCustomers.length > itemsPerPage && (
          <div className="flex flex-row justify-between items-center mt-6 px-4 gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MoveLeft /> Previous
            </button>

            <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
              {renderPagination()}
            </div>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <MoveRight />
            </button>

            <div className="hidden lg:block text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}{" "}
              of {filteredCustomers.length}
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedCustomer?.name || "Customer Details"}
            </DialogTitle>
            <DialogDescription>
              Sales and empties information for this customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Total Sales – uneditable input */}
            <div className="space-y-2">
              <Label>Total Sales</Label>
              <Input
                value={`₦${selectedCustomer?.totalSales?.toLocaleString() ?? "0"}`}
                readOnly
                className="bg-[#FAFAFA] text-gray-900 cursor-default border-gray-300 focus-visible:ring-0 shadow-sm"
              />
            </div>

            {/* Empties Returned Count – uneditable input */}
            <div className="space-y-2">
              <Label>Empties Returned</Label>
              <Input
                value={selectedCustomer?.customer_empties?.length ?? 0}
                readOnly
                className="bg-[#FAFAFA] text-gray-900 cursor-default border-gray-300 focus-visible:ring-0 shadow-sm"
              />
            </div>

            {/* Empties Details – safe conditional */}
            {(selectedCustomer?.customer_empties?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                <Label>Empties Details</Label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                  <ul className="space-y-2 text-sm">
                    {selectedCustomer!.customer_empties.map(
                      (empty: any, index: number) => (
                        <li
                          key={index}
                          className="flex justify-between items-center py-1 px-2 bg-white rounded border border-gray-200"
                        >
                          <span>{empty.name || "Unnamed"}</span>
                          <span className="font-medium">
                            Qty: {empty.quantity || "N/A"}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4 italic">
                No empties recorded for this customer yet.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedCustomer(null)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customer;
