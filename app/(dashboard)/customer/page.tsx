/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomerForm, customerSchema } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCustomers } from "@/actions/getcustomers";
import {
  handleCreateCustomer,
  handleUpdateCustomer,
} from "@/lib/utils/api/apiHelper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipLoader } from "react-spinners";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

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
  customer_empties: any[];
}

const emptyFormValues: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  type: undefined as any,
  address: { address: "", latitude: 0, longitude: 0 },
};

const Customer = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<CustomerType | null>(
    null,
  );
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: emptyFormValues,
  });

  const isEditing = !!editingCustomer;

  const openCustomerModal = (customerToEdit: CustomerType | null = null) => {
    if (customerToEdit) {
      setEditingCustomer(customerToEdit);
      form.reset({
        name: customerToEdit.name,
        email: customerToEdit.email || "",
        phone: customerToEdit.phone,
        type: customerToEdit.type as any,
        address: {
          address: customerToEdit.address?.address || "",
          latitude: customerToEdit.address?.latitude || 0,
          longitude: customerToEdit.address?.longitude || 0,
        },
      });
    } else {
      setEditingCustomer(null);
      form.reset(emptyFormValues);
    }
    setIsCustomerModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setEditingCustomer(null);
      form.reset(emptyFormValues);
    }
    setIsCustomerModalOpen(open);
  };

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
        toast.error(err?.message || "Error loading customers");
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const refreshCustomers = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const result = await getCustomers(token);
      if (result.success && result.data) {
        setCustomers(result.data);
      }
    }
  };

  const onSubmit = async (data: CustomerForm) => {
    try {
      const basePayload = {
        name: data.name.trim(),
        phone: data.phone,
        type: data.type,
        address: {
          latitude: data.address.latitude,
          longitude: data.address.longitude,
          address: data.address.address.trim(),
        },
      };

      let response;
      if (isEditing && editingCustomer) {
        // update — no email
        response = await handleUpdateCustomer(editingCustomer.id, basePayload);
      } else {
        // create — email required
        response = await handleCreateCustomer({
          ...basePayload,
          email: data.email.trim(),
        });
      }

      if ([200, 201].includes(response.statusCode)) {
        toast.success(
          response.msg ||
            (isEditing
              ? "Customer updated successfully"
              : "Customer created successfully"),
        );
        handleModalClose(false);
        refreshCustomers();
      } else {
        toast.error(response.error || "Failed to save customer");
      }
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    }
  };

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.phone} ${c.email} ${c.type} ${c.address?.address || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2F2F2F] font-clash">
            Customer List
          </h1>
          <p className="text-[#9E9A9A] font-medium">
            View your customers list, track your sales and owed empties.
          </p>
        </div>

        <Button
          className="bg-[#0A6DC0] hover:bg-[#09599a] text-white flex items-center gap-2 px-6 py-5"
          onClick={() => openCustomerModal()}
        >
          <Plus size={18} /> Add New Customer
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search customers..."
          className="pl-10 bg-[#F2F2F7] py-6"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-700">
                  Name
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-700 hidden md:table-cell">
                  Phone
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-700 hidden md:table-cell">
                  Total Sales
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-700 hidden md:table-cell">
                  Empties Owed
                </th>
                <th className="text-left px-6 py-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoadingCustomers ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="mt-4 text-gray-500">Loading customers...</p>
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-500">
                    {searchQuery
                      ? "No matching customers found"
                      : "No customers yet"}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => {
                  const emptiesOwed =
                    customer.customer_empties?.reduce(
                      (sum: number, e: any) =>
                        sum +
                        (e.attributes?.remainingQuantity ?? e.quantity ?? 0),
                      0,
                    ) ?? 0;

                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/70">
                      <td className="px-6 py-4 font-medium">{customer.name}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        ₦{customer.totalSales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {emptiesOwed > 0 ? emptiesOwed : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openCustomerModal(customer)}
                            >
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/customer/${customer.id}`)
                              }
                            >
                              View Empty Returns
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isCustomerModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Customer" : "Create New Customer"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update customer information"
                : "Enter details to add a new customer"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#D8D8D866] h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show email only when creating */}
              {!isEditing && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="customer@example.com"
                          className="bg-[#D8D8D866] h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
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
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#D8D8D866] h-12">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Distributor">Distributor</SelectItem>
                        <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="Retailer">Retailer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <PlacesAutocompleteInput
                        placeholder="Enter business address"
                        value={field.value?.address || ""}
                        onChange={(val) => {
                          if (typeof val === "string") {
                            field.onChange({ ...field.value, address: val });
                          } else {
                            field.onChange({
                              address: val.name,
                              latitude: val.lat,
                              longitude: val.lng,
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

              <DialogFooter className="mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleModalClose(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-[#0A6DC0] hover:bg-[#09599a]"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      {isEditing ? "Updating..." : "Creating..."}
                      <ClipLoader size={18} color="white" className="ml-2" />
                    </>
                  ) : isEditing ? (
                    "Update Customer"
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
  );
};

export default Customer;
