/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Input } from "@/components/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Info, Check, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { handleCreateStock } from "@/lib/utils/api/apiHelper";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createStockSchema,
  CreateStockFormData,
  Product,
} from "@/types/stock";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProduct";

interface StockProps {
  storeId: string;
}

const Stock: React.FC<StockProps> = ({ storeId }) => {
  const {
    products: initialProducts,
    isLoading: loadingProducts,
    fetchAllProducts,
  } = useProducts();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmptiesModalOpen, setIsEmptiesModalOpen] = useState(false);
  const [tempEmptiesQty, setTempEmptiesQty] = useState("");
  const [tempEmptiesPrice, setTempEmptiesPrice] = useState("");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const router = useRouter();

  const form = useForm<CreateStockFormData>({
    resolver: zodResolver(createStockSchema),
    defaultValues: {
      product_id: "",
      quantity: "",
      empties_qty: "",
      empties_price: "",
      cost_price: "",
      selling_price: "",
      selling_price_pieces: "",
      exp_date: "",
      sku: "",
      stock_alert_no: "",
      type: "packs",
      batch: "",
      supplier: "",
    },
  });

  // Sync initial products when they load
  useEffect(() => {
    if (initialProducts.length > 0 && !searchQuery.trim()) {
      setDisplayProducts(initialProducts);
    }
  }, [initialProducts, searchQuery]);

  // Handle search → call API to get all products, then filter
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchLoading(true);

    try {
      if (!query || query.trim() === "") {
        setDisplayProducts(initialProducts);
      } else {
        // Fetch all products when searching
        const allProducts = await fetchAllProducts(query);
        
        // Filter based on search query
        const lowerQuery = query.toLowerCase();
        const filtered = allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.productType?.toLowerCase().includes(lowerQuery) ||
            product.containerType?.toLowerCase().includes(lowerQuery) ||
            product.sizeCl?.toString().includes(query),
        );
        
        setDisplayProducts(filtered);
      }
    } catch (err) {
      console.error("Product search failed:", err);
      toast.error("Failed to load products. Please try again.");
      setDisplayProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = displayProducts.find((p) => p.id === productId);
    if (product) {
      const generatedSku = product.name
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
      form.setValue("sku", generatedSku);
      form.setValue("product_id", productId);
    }
    setOpen(false);
    // Reset search state after selection
    setSearchQuery("");
    setDisplayProducts(initialProducts);
  };

  // Find selected product (prefer display list in case it was searched)
  const selectedProduct =
    displayProducts.find((p) => p.id === form.watch("product_id")) ||
    initialProducts.find((p) => p.id === form.watch("product_id"));

  const handleSaveEmpties = () => {
    if (!tempEmptiesQty || tempEmptiesQty.trim() === "") {
      toast.error("Please enter empties quantity");
      return;
    }

    if (!tempEmptiesPrice || tempEmptiesPrice.trim() === "") {
      toast.error("Please enter empties price");
      return;
    }

    // Validate numeric values
    const qty = parseInt(tempEmptiesQty, 10);
    const price = parseFloat(tempEmptiesPrice);

    if (isNaN(qty) || qty < 0) {
      toast.error("Please enter a valid empties quantity");
      return;
    }

    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid empties price");
      return;
    }

    form.setValue("empties_qty", qty.toString());
    form.setValue("empties_price", price.toString());
    setIsEmptiesModalOpen(false);
    toast.success("Empties added successfully");
    setTempEmptiesQty("");
    setTempEmptiesPrice("");
  };

  const safeParseInt = (val: string | undefined): number => {
    if (!val || val === "") return 0;
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  };

  const safeParseFloat = (val: string | undefined): number => {
    if (!val || val === "") return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const onSubmit = async (values: CreateStockFormData) => {
    setIsSubmitting(true);

    // Parse all numeric values
    const quantity = safeParseInt(values.quantity);
    const emptiesQty = safeParseInt(values.empties_qty);
    const emptiesPrice = safeParseFloat(values.empties_price);
    const costPrice = safeParseFloat(values.cost_price);
    const sellingPrice = safeParseFloat(values.selling_price);
    const sellingPricePieces = safeParseFloat(values.selling_price_pieces);
    const stockAlertNo = safeParseInt(values.stock_alert_no);

    // Validate ALL required fields (everything except batch and supplier)
    if (!values.product_id || values.product_id.trim() === "") {
      toast.error("Please select a product");
      setIsSubmitting(false);
      return;
    }

    if (quantity <= 0) {
      toast.error("Please enter a valid quantity (must be greater than 0)");
      setIsSubmitting(false);
      return;
    }

    // Empties are optional - no validation needed, backend will handle 0 values

    if (costPrice <= 0) {
      toast.error("Please enter a valid cost price (must be greater than 0)");
      setIsSubmitting(false);
      return;
    }

    if (sellingPrice <= 0) {
      toast.error("Please enter a valid selling price (must be greater than 0)");
      setIsSubmitting(false);
      return;
    }

    if (sellingPricePieces <= 0) {
      toast.error("Please enter a valid selling price per piece (must be greater than 0)");
      setIsSubmitting(false);
      return;
    }

    if (!values.exp_date || values.exp_date.trim() === "") {
      toast.error("Please select an expiry date");
      setIsSubmitting(false);
      return;
    }

    if (!values.sku || values.sku.trim() === "") {
      toast.error("SKU is required");
      setIsSubmitting(false);
      return;
    }

    if (stockAlertNo < 0) {
      toast.error("Stock alert number cannot be negative");
      setIsSubmitting(false);
      return;
    }

    const payload: any = {
      product_id: values.product_id,
      store_id: storeId,
      quantity: quantity,
      empties_qty: emptiesQty,
      empties_price: emptiesPrice,
      cost_price: costPrice,
      selling_price: sellingPrice,
      selling_price_pieces: sellingPricePieces,
      exp_date: values.exp_date.trim(),
      sku: values.sku.trim(),
      stock_alert_no: stockAlertNo,
      attributes: {
        type: values.type,
        batch: (values.batch || "").trim(),
        supplier: (values.supplier || "").trim(),
      },
    };

    console.log("Sending stock payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await handleCreateStock(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Stock added successfully!");
        form.reset({
          product_id: "",
          quantity: "",
          empties_qty: "",
          empties_price: "",
          cost_price: "",
          selling_price: "",
          selling_price_pieces: "",
          exp_date: "",
          sku: "",
          stock_alert_no: "",
          type: "packs",
          batch: "",
          supplier: "",
        });
        router.push("/dashboards/inventory/my-store");
      } else {
        toast.error(response.error || "Failed to add stock. Please try again.");
        console.error("Server response:", response);
      }
    } catch (error: any) {
      console.error("Error creating stock:", error);
      toast.error(error.message || "Failed to add stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void,
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    onChange(value);
  };

  const handleDecimalInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void,
  ) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = value.split(".");
    if (parts.length > 2) {
      return;
    }
    onChange(value);
  };

  return (
    <div>
      <Card className="md:p-6 max-w-[50rem] mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-[18px] text-[#2F2F2F] font-semibold font-clash">
            Add New Stock
          </h2>
          <span className="text-sm text-gray-500">(Store ID: {storeId})</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Searchable Product Combobox */}
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium">
                    Select Product 
                  </FormLabel>

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "w-full justify-between h-12 bg-[#F3F4F6] text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loadingProducts}
                      >
                        {selectedProduct ? (
                          <div className="flex items-center gap-3 truncate max-w-full">
                            {selectedProduct.image && (
                              <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                                <Image
                                  src={selectedProduct.image}
                                  alt={selectedProduct.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex flex-col truncate">
                              <span className="font-medium text-[#2F2F2F]">
                                {selectedProduct.name}
                              </span>
                              <span className="text-sm text-[#6B7280] truncate">
                                {selectedProduct.productType} • {selectedProduct.sizeCl}cl •{" "}
                                {selectedProduct.containerType}
                              </span>
                            </div>
                          </div>
                        ) : loadingProducts ? (
                          <span className="text-gray-400">Loading products...</span>
                        ) : (
                          "Select a product..."
                        )}

                        <ChevronDown
                          className={cn(
                            "ml-2 h-4 w-4 shrink-0 opacity-50",
                            open && "rotate-180"
                          )}
                        />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[360px]"
                      align="start"
                    >
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search by name, type, size..."
                          value={searchQuery}
                          onValueChange={handleSearch}
                          className="h-10"
                        />
                        <CommandList>
                          {searchLoading ? (
                            <div className="py-6 flex justify-center">
                              <ClipLoader size={24} color="#0A6DC0" />
                            </div>
                          ) : (
                            <>
                              <CommandEmpty>No product found.</CommandEmpty>

                              <CommandGroup>
                                {displayProducts.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={product.id}
                                    onSelect={() => handleProductSelect(product.id)}
                                    className="cursor-pointer py-3 px-4 hover:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      {product.image ? (
                                        <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                          <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                                          No img
                                        </div>
                                      )}

                                      <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-sm">
                                          {product.name}
                                        </span>
                                        <span className="text-xs text-gray-500 truncate">
                                          {product.productType} • {product.sizeCl}cl •{" "}
                                          {product.containerType}
                                        </span>
                                      </div>
                                    </div>

                                    {field.value === product.id && (
                                      <Check className="h-4 w-4 text-[#0A6DC0]" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium">
                    Add Product in 
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-8"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="packs" id="packs" />
                        <label
                          htmlFor="packs"
                          className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium cursor-pointer"
                        >
                          Packs/Crates
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pieces" id="pieces" />
                        <label
                          htmlFor="pieces"
                          className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium cursor-pointer"
                        >
                          Pieces/Bottles
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity + Empties */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                      Quantity 
                    </FormLabel>

                    <Dialog
                      open={isEmptiesModalOpen}
                      onOpenChange={setIsEmptiesModalOpen}
                    >
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-[#0A6DC0] text-[16px] font-medium hover:underline"
                        >
                          + Add empties count and its price
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-[#0E0E0F] font-bold font-dm-sans text-[20px]">
                            Add Empties
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium">
                              How many Empties?
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g. 10"
                              value={tempEmptiesQty}
                              onChange={(e) => setTempEmptiesQty(e.target.value)}
                              className="mt-2 h-12"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium">
                              Empties Price (per unit)
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g. 50"
                              value={tempEmptiesPrice}
                              onChange={(e) => setTempEmptiesPrice(e.target.value)}
                              className="mt-2 h-12"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEmptiesModalOpen(false);
                              setTempEmptiesQty("");
                              setTempEmptiesPrice("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveEmpties}
                            className="bg-[#0A6DC0] hover:bg-[#09599a]"
                          >
                            Save
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter quantity"
                      value={field.value}
                      onChange={(e) => handleNumericInput(e, field.onChange)}
                      className="bg-[#F3F4F6] h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Empties summary */}
            {form.watch("empties_qty") && Number(form.watch("empties_qty")) > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-[#2F2F2F] font-medium">
                    <span className="text-[14px]">Empties Added:</span>{" "}
                    <span className="text-[14px] font-bold">
                      {form.watch("empties_qty")} units @ ₦
                      {form.watch("empties_price") || "0"} each
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      form.setValue("empties_qty", "");
                      form.setValue("empties_price", "");
                      toast.success("Empties removed");
                    }}
                    className="text-red-500 hover:text-red-700 h-auto p-1"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Cost Price */}
            <FormField
              control={form.control}
              name="cost_price"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                      Cost Price 
                    </FormLabel>
                    <Info className="w-4 h-4 text-[#0A6DC0]" />
                  </div>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₦
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 4300"
                        value={field.value}
                        onChange={(e) => handleDecimalInput(e, field.onChange)}
                        className="bg-[#F3F4F6] h-12 pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selling Price (Main) */}
            <FormField
              control={form.control}
              name="selling_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                    Selling Price (
                    {form.watch("type") === "packs"
                      ? "Packs/Crates"
                      : "Pieces/Bottles"}
                    ) 
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₦
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 5000"
                        value={field.value}
                        onChange={(e) => handleDecimalInput(e, field.onChange)}
                        className="bg-[#F3F4F6] h-12 pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selling Price per Piece */}
            <FormField
              control={form.control}
              name="selling_price_pieces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                    Selling Price (Per Piece/Bottle) 
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₦
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 200"
                        value={field.value}
                        onChange={(e) => handleDecimalInput(e, field.onChange)}
                        className="bg-[#F3F4F6] h-12 pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col lg:flex-row items-start gap-4">
              {/* Batch */}
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                      Batch Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. B231"
                        {...field}
                        className="bg-[#F3F4F6] h-12 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Supplier */}
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                      Supplier
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. LagosDepot"
                        {...field}
                        className="bg-[#F3F4F6] h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-4">
              {/* Expiry Date */}
              <FormField
                control={form.control}
                name="exp_date"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                      Expiry Date 
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-[#F3F4F6] h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Low Stock Alert */}
              <FormField
                control={form.control}
                name="stock_alert_no"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                        Low Stock Alert 
                      </FormLabel>
                      <Info className="w-4 h-4 text-[#0A6DC0]" />
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        {...field}
                        className="bg-[#F3F4F6] h-12"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                    SKU 
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Auto-generated from the selected product"
                      {...field}
                      className="bg-[#F3F4F6] h-12 placeholder:text-[12px]"
                    />
                  </FormControl>
                  <p className="text-[12px] text-gray-500">
                    Automatically filled from product name
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
             
              <Button
                type="submit"
                disabled={isSubmitting || !form.watch("product_id")}
                className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] h-12 text-[16px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    Adding Stock...{" "}
                    <ClipLoader size={20} color="white" className="ml-2" />
                  </>
                ) : (
                  "Add Stock"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Stock;