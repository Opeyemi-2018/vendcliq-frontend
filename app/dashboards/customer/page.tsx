"use client";

import { CustomerForm, customerSchema } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Mail, Search, X, Plus, Trash2, UserPen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteCustomer, getCustomers } from "@/actions/getcustomers";
import { handleCreateCustomer } from "@/lib/utils/api/apiHelper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipLoader } from "react-spinners";
import { ThreeDots } from "react-loader-spinner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Card } from "@/components/ui/card";

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
}

const Customer = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

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

  const onDeleteCustomer = async (customerId: string) => {
    try {
      setDeletingId(customerId);
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const result = await deleteCustomer(token, customerId);

      if (result.success) {
        toast.success(result.message || "Customer deleted successfully");
        const refreshResult = await getCustomers(token);
        if (refreshResult.success && refreshResult.data) {
          setCustomers(refreshResult.data);
        }
      } else {
        toast.error(result.error || "Failed to delete customer");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error deleting customer");
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(null);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email} ${customer.type} ${
      customer.address || ""
    }`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex md:items-center justify-between gap-3 md:gap-0  flex-col md:flex-row mb-6">
        <div>
          <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
            Customer List
          </h1>
          <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
            View your customers list, track your sales and owed empties.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="bg-[#0A6DC0] hover:bg-[#09599a] text-white flex items-center gap-2 px-6 py-5 md:py-6">
              <Plus size={18} />
              Add New Customer
            </Button>
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
                        <ClipLoader size={18} color="white" className="ml-2" />
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

      <Card className="mt-3 py-5 relative">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-[#E6E6E6]">
              <tr>
                <th className="text-left pl-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                  Name
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                  Phone
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                  Email
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                  Type
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                  Address
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
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
                      <UserPen size={40} className="text-gray-400" />
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
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                  >
                    <td className="py-4 pl-4 font-medium">{customer.name}</td>
                    <td className="py-4">{customer.phone}</td>
                    <td className="py-4">{customer.email}</td>
                    <td className="py-4">{customer.type}</td>
                    <td className="py-4">{customer.address?.address}</td>
                    <td className="py-4">
                      <Dialog
                        open={deleteDialogOpen === customer.id}
                        onOpenChange={(open) =>
                          setDeleteDialogOpen(open ? customer.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Customer</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete{" "}
                              <strong className="text-black">
                                {customer.name}
                              </strong>
                              ?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-3 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setDeleteDialogOpen(null)}
                              disabled={deletingId === customer.id}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={async () => {
                                await onDeleteCustomer(customer.id);
                                setDeleteDialogOpen(null);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={deletingId === customer.id}
                            >
                              {deletingId === customer.id ? (
                                <>
                                  Deleting...
                                  <ClipLoader
                                    size={18}
                                    color="white"
                                    className="mr-2"
                                  />
                                </>
                              ) : (
                                "Delete"
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Customer;
