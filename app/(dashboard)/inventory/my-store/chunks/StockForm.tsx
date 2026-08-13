/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/StockForm.tsx
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
import { cn } from "@/lib/utils";
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
import "react-phone-input-2/lib/style.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStockSchema, CreateStockFormData, Product } from "@/types/stock";
import { Check, ChevronDown, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { formatPriceInput, parsePriceInput } from "@/lib/priceInput";
import Image from "next/image";
import { useProducts } from "@/hooks/useProduct";
import { useCreateStock } from "@/hooks/useStores";

interface StockFormProps {
  /** Lets a host (the Add Stock sheet) drive its own submit button. */
  onStateChange?: (state: { submitting: boolean; ready: boolean }) => void;
  storeId: string;
  /** Receives the new stock so a host can attach conditions to it. */
  onSuccess?: (created?: {
    id?: string;
    productName?: string;
    sellingPrice?: number;
  }) => void;
  /** Hosts that show their own success UI turn the toast off. */
  successToast?: boolean;
}

const StockForm: React.FC<StockFormProps> = ({
  storeId,
  onSuccess,
  successToast = true,
  onStateChange,
}) => {
  const {
    products,
    isLoading: loadingProducts,
    fetchAllProducts,
  } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Inline disclosure rather than a nested modal: this form now renders
  // inside a custom sheet, and a nested Radix dialog stacks behind it.
  const [showEmpties, setShowEmpties] = useState(false);
  const [tempEmptiesQty, setTempEmptiesQty] = useState("");
  const [tempEmptiesPrice, setTempEmptiesPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayProducts, setDisplayProducts] = useState<Product[]>(products);
const createStock = useCreateStock();

  // Update display products when initial products change
  useEffect(() => {
    if (!searchQuery) {
      setDisplayProducts(products);
    }
  }, [products, searchQuery]);

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

  // Publish state so the sheet's sticky button can disable and show a spinner.
  const productChosen = Boolean(form.watch("product_id"));
  useEffect(() => {
    onStateChange?.({ submitting: isSubmitting, ready: productChosen });
  }, [isSubmitting, productChosen, onStateChange]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query || query.trim() === "") {
      setDisplayProducts(products);
      return;
    }

    // Fetch all products when searching
    const allProducts = await fetchAllProducts(query);

    // Filter based on search query
    const lowerQuery = query.toLowerCase();
    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.productType?.toLowerCase().includes(lowerQuery) ||
        product.containerType?.toLowerCase().includes(lowerQuery) ||
        product.sizeCl?.toString().includes(query) ||
        product.itemsPerPack?.toString().includes(query),
    );

    setDisplayProducts(filtered);
  };

  const handleProductChange = (productId: string) => {
    const product = displayProducts.find((p) => p.id === productId);
    setSelectedProduct(product || null);

    if (product) {
      // Better SKU: use full name or a meaningful part
      // Adjust this logic based on what your server actually expects
      const generatedSku = product.name
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
      form.setValue("sku", generatedSku);
    } else {
      form.setValue("sku", "");
    }

    form.setValue("product_id", productId);
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

  // Inside the component, replace the onSubmit with:


const onSubmit = async (values: CreateStockFormData) => {
  setIsSubmitting(true);

  const payload: any = {
    product_id: values.product_id,
    store_id: storeId,
    quantity: safeParseInt(values.quantity),
    empties_qty: safeParseInt(values.empties_qty),
    empties_price: safeParseFloat(values.empties_price),
    cost_price: safeParseFloat(values.cost_price),
    selling_price: safeParseFloat(values.selling_price),
    selling_price_pieces: safeParseFloat(values.selling_price_pieces),
    exp_date: values.exp_date.trim(),
    sku: values.sku.trim(),
    stock_alert_no: safeParseInt(values.stock_alert_no),
    attributes: {
      type: values.type,
      batch: (values.batch || "").trim(),
      supplier: (values.supplier || "").trim(),
    },
  };

  try {
    const response = await createStock.mutateAsync(payload);
    if (response.statusCode === 200 || response.statusCode === 201) {
      if (successToast) toast.success("Stock added successfully!");
      form.reset();
      setSelectedProduct(null);
      onSuccess?.({
        id: response.data?.id ? String(response.data.id) : undefined,
        productName: selectedProduct?.name,
        sellingPrice: Number(values.selling_price) || undefined,
      });
    } else {
      toast.error(response.error || "Failed to add stock");
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to add stock");
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
    <Form {...form}>
      <form id="add-stock-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Selection */}
        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => {
            const selectedProduct = displayProducts.find(
              (p) => p.id === field.value,
            );

            return (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium">
                  Select Product 
                </FormLabel>

                <Popover open={open} onOpenChange={setOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between h-12 bg-[#F3F4F6] border border-input hover:bg-accent hover:text-accent-foreground",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={loadingProducts || products.length === 0}
                    >
                      {selectedProduct ? (
                        <div className="flex items-center gap-3 truncate max-w-[calc(100%-2rem)]">
                          {selectedProduct.image && (
                            <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                              <Image
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="flex flex-col items-start truncate">
                            <span className="font-medium">
                              {selectedProduct.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {selectedProduct.productType} •{" "}
                              {selectedProduct.sizeCl}cl •{" "}
                              {selectedProduct.containerType}
                              {selectedProduct.itemsPerPack
                                ? ` • Pack of ${selectedProduct.itemsPerPack}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      ) : loadingProducts ? (
                        <span className="text-gray-400">
                          Loading products...
                        </span>
                      ) : products.length === 0 ? (
                        <span className="text-gray-400">
                          No products available
                        </span>
                      ) : (
                        "Select product..."
                      )}

                      <ChevronDown
                        className={cn(
                          "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
                          open && "rotate-180",
                        )}
                      />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-full p-0 max-h-[320px]"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search by name, type, size..."
                        className="h-9"
                        onValueChange={handleSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingProducts ? (
                            <div className="flex justify-center py-6">
                              <ClipLoader size={24} color="#0A6DC0" />
                            </div>
                          ) : (
                            "No product found."
                          )}
                        </CommandEmpty>

                        <CommandGroup>
                          {displayProducts.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.id}
                              onSelect={() => {
                                handleProductChange(product.id);
                                setOpen(false);
                                setSearchQuery("");
                                setDisplayProducts(products);
                              }}
                              className="cursor-pointer py-3 px-4 hover:bg-gray-50"
                            >
                              <div className="flex items-center justify-between w-full gap-4">
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
                                          (
                                            e.target as HTMLImageElement
                                          ).style.display = "none";
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                                      No img
                                    </div>
                                  )}

                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium text-sm">
                                      {product.name}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate">
                                      {product.productType} • {product.sizeCl}cl
                                      • {product.containerType}
                                      {product.itemsPerPack
                                        ? ` • Pack of ${product.itemsPerPack}`
                                        : ""}
                                    </span>
                                  </div>
                                </div>

                                {field.value === product.id && (
                                  <Check className="h-4 w-4 text-[#0A6DC0]" />
                                )}
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
            );
          }}
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

        {/* Quantity + Empties trigger */}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-2">
                <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                  Quantity 
                </FormLabel>

                <button
                  type="button"
                  onClick={() => setShowEmpties((v) => !v)}
                  className="text-[#0A6DC0] text-[16px] font-medium hover:underline"
                >
                  {showEmpties
                    ? "− Remove empties count"
                    : "+ Add empties count and its price"}
                </button>
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

        {showEmpties && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-[12px] border border-[#D8D8D8B3] bg-[#FAFBFC] p-4">
            <FormField
              control={form.control}
              name="empties_qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] text-[15px] font-medium">
                    How many empties?
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      className="h-12 bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="empties_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] text-[15px] font-medium">
                    Empties price (per unit)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 50"
                      value={formatPriceInput(field.value)}
                      onChange={(e) =>
                        field.onChange(parsePriceInput(e.target.value))
                      }
                      className="h-12 bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Show added empties summary */}
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
              <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                Cost Price 
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₦
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter cost price"
                    value={formatPriceInput(field.value)}
                    onChange={(e) =>
                      field.onChange(parsePriceInput(e.target.value))
                    }
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
                    placeholder="Enter selling price"
                    value={formatPriceInput(field.value)}
                    onChange={(e) =>
                      field.onChange(parsePriceInput(e.target.value))
                    }
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
                Selling Price (Per Piece/Bottle){" "}
                
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₦
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter price per piece"
                    value={formatPriceInput(field.value)}
                    onChange={(e) =>
                      field.onChange(parsePriceInput(e.target.value))
                    }
                    className="bg-[#F3F4F6] h-12 pl-8"
                  />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col lg:flex-row items-start gap-4">
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
          <FormField
            control={form.control}
            name="exp_date"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                  Expiry Date 
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-[#F3F4F6] h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

      </form>
    </Form>
  );
};

export default StockForm;
