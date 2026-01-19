"use client";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, UserPen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { handleCreateExpense } from "@/lib/utils/api/apiHelper";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { useStores } from "@/hooks/useStores";
import { deleteExpenses, getExpenses } from "@/actions/expense";
import { Expense } from "@/types/expenses";
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
import { Card } from "@/components/ui/card";

const expenseCategories = [
  "RENT",
  "UTILITIES",
  "SALARIES",
  "SUPPLIES",
  "MARKETING",
  "TRANSPORTATION",
  "MAINTENANCE",
  "INSURANCE",
  "TAXES",
  "OTHER",
];

const expenseFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  store_id: z.string().min(1, "Store ID is required"),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const Expenses = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpense] = useState<Expense[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const { stores, isLoading: isLoadingStores } = useStores();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      store_id: "",
    },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      setIsLoading(true);
      const response = await handleCreateExpense(data);

      // Check for statusCode 201 or presence of data
      if (response.statusCode === 201 || response.data) {
        toast.success("Expense created successfully");
        form.reset();
        setOpen(false);
      } else {
        toast.error("Failed to create expense");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while creating expense",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      setExpenseLoading(true);
      try {
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");
        if (!token) return;

        const result = await getExpenses(token);

        if (result.success && result.data) {
          setExpense(result.data);
        } else {
          // Use the actual error message from the result
          toast.error(result.error || "Failed to load expense");
        }
      } catch (err) {
        toast.error("Network error");
      } finally {
        setExpenseLoading(false);
      }
    };

    fetchExpenses();
  }, []);

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

      const result = await deleteExpenses(token, customerId);

      if (result.success) {
        toast.success(result.message || "Customer deleted successfully");
        const refreshResult = await getExpenses(token);
        if (refreshResult.success && refreshResult.data) {
          setExpense(refreshResult.data);
        }
      } else {
        toast.error(result.error || "Failed to delete expense");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error deleting expense");
    } finally {
      setDeletingId(null);
    }
  };

  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const categoryTotals = expenses.reduce(
    (acc, exp) => {
      const amount = Number(exp.amount) || 0;
      acc[exp.category] = (acc[exp.category] || 0) + amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Find the category with highest total
  const highestCategoryEntry = Object.entries(categoryTotals).reduce(
    (max, [cat, total]) => (total > max[1] ? [cat, total] : max),
    ["", 0] as [string, number],
  );

  const highestCategory = highestCategoryEntry[0];
  // const highestCategoryTotal = highestCategoryEntry[1];

  return (
    <div>
      <div className="flex md:items-center justify-between gap-3 md:gap-0  flex-col md:flex-row mb-6">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
            Expenses
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            track and manage expenses. Understand and control your business
            spending easily.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0A6DC0] hover:bg-[#09599a] text-white flex items-center gap-2 px-6 py-5 md:py-6">
              <Plus size={18} />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[20px] md:text-[25px] font-clash font-semibold text-[#2F2F2F]">
                Add New Expense
              </DialogTitle>
              <DialogDescription className="text-[16px] font-dm-sans text-[#9E9A9A]">
                Fill in the necessary to add a new expense{" "}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px]">
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#D8D8D866] h-12">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px]">
                        Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter amount"
                          value={field.value as number | ""} // ← type assertion here
                          onChange={(e) => {
                            const val = e.target.valueAsNumber;
                            field.onChange(isNaN(val) ? 0 : val);
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          disabled={field.disabled}
                          name={field.name}
                          className="bg-[#D8D8D866] h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px]">
                        Select Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="bg-[#D8D8D866] h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px]">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter expense description"
                          className="resize-none bg-[#D8D8D866] h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="store_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px]">
                        Store
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingStores}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#D8D8D866] h-12">
                            <SelectValue
                              placeholder={
                                isLoadingStores
                                  ? "Loading stores..."
                                  : "Select a store"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#0A6DC0] hover:bg-[#09599a]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        Creating...{" "}
                        <ClipLoader size={18} color="white" className="ml-2" />
                      </>
                    ) : (
                      "Create Expense"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Total Expenses for the period
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            ₦{total}
          </h2>
        </div>
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Expenses This Month
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            coming soon
          </h2>
        </div>
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Highest Expenses Category
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {highestCategory}
          </h2>
        </div>
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Total Number of Expenses
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {expenses.length}
          </h2>
        </div>
      </div>

      <Card className="md:p-5">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold">
          Expense List View ({expenses.length})
        </h1>

        <Card className="mt-3 py-5 relative">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="border-b border-[#E6E6E6]">
                <tr>
                  <th className="text-left pl-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    Amount
                  </th>
                  <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    Category
                  </th>
                  <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    Data
                  </th>
                  <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    Description
                  </th>
                  <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenseLoading ? (
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
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 px-4">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <UserPen size={40} className="text-gray-400" />
                        <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                          "No expense found"
                        </p>
                        <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                          "Your customers will appear here
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                    >
                      <td className="py-4 pl-4 font-medium">
                        #{expense.amount}
                      </td>
                      <td className="py-4">{expense.category}</td>
                      <td className="py-4">{expense.date}</td>
                      <td className="py-4">{expense.description}</td>
                      <td className="py-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Customer
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong className="text-black">
                                  {expense.category}
                                </strong>
                                ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteCustomer(expense.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={deletingId === expense.id}
                              >
                                {deletingId === expense.id ? (
                                  <>
                                    <ClipLoader
                                      size={18}
                                      color="white"
                                      className="mr-2"
                                    />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default Expenses;
