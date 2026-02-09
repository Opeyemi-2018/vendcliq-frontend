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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createStockSchema, CreateStockFormData } from "@/types/stock";
import { Check, ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { handleCreateStock } from "@/lib/utils/api/apiHelper";
import Image from "next/image";
import { useProducts } from "@/hooks/useProduct";

interface StockFormProps {
  storeId: string;
  onSuccess?: () => void;
}

const StockForm: React.FC<StockFormProps> = ({ storeId, onSuccess }) => {
  const { products, isLoading: loadingProducts } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmptiesModalOpen, setIsEmptiesModalOpen] = useState(false);
  const [tempEmptiesQty, setTempEmptiesQty] = useState("");
  const [tempEmptiesPrice, setTempEmptiesPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [open, setOpen] = useState(false);

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

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
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

  const handleSaveEmpties = () => {
    if (!tempEmptiesQty) {
      toast.error("Please enter empties quantity");
      return;
    }
    // price is optional now — server might accept 0 or null
    form.setValue("empties_qty", tempEmptiesQty);
    form.setValue("empties_price", tempEmptiesPrice || "0");
    setIsEmptiesModalOpen(false);
    toast.success("Empties added");
    setTempEmptiesQty("");
    setTempEmptiesPrice("");
  };

  const safeParseInt = (val: string | undefined): number => {
    if (!val) return 0;
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  };

  const safeParseFloat = (val: string | undefined): number => {
    if (!val) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const onSubmit = async (values: CreateStockFormData) => {
    setIsSubmitting(true);

    const emptiesQty = safeParseInt(values.empties_qty);

    const payload: any = {
      product_id: values.product_id,
      store_id: storeId,
      quantity: safeParseInt(values.quantity),
      empties_qty: emptiesQty,
      cost_price: safeParseFloat(values.cost_price),
      selling_price: safeParseFloat(values.selling_price),
      selling_price_pieces: safeParseFloat(values.selling_price_pieces),
      exp_date: values.exp_date?.trim() || "",
      sku: (values.sku || selectedProduct?.name || "").trim(),
      stock_alert_no: safeParseInt(values.stock_alert_no),
      attributes: {
        type: values.type,
        batch: (values.batch || "").trim(),
        supplier: (values.supplier || "").trim(),
      },
    };

    // Only include empties_price when there are empties
    if (emptiesQty > 0) {
      payload.empties_price = safeParseFloat(values.empties_price);
    }

    console.log("Sending stock payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await handleCreateStock(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Stock added successfully!");
        form.reset();
        setSelectedProduct(null);
        onSuccess?.();
      } else {
        toast.error(response.error || "Failed to add stock");
        console.error("Server response:", response);
      }
    } catch (error: any) {
      console.error("Error creating stock:", error);
      toast.error(error.message || "Network/server error while adding stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Selection */}
        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => {
            const selectedProduct = products.find((p) => p.id === field.value);

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
                    <Command shouldFilter={true}>
                      <CommandInput
                        placeholder="Search by name, type, size..."
                        className="h-9"
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
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name.toLowerCase()} // helps with filtering
                              onSelect={() => {
                                handleProductChange(product.id);
                                setOpen(false);
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
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEmptiesModalOpen(false)}
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
                  type="number"
                  placeholder="Enter quantity"
                  {...field}
                  className="bg-[#F3F4F6] h-12"
                  min="1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Show added empties summary */}
        {form.watch("empties_qty") && Number(form.watch("empties_qty")) > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg">
            <div className="text-[#2F2F2F] font-medium">
              <span className="text-[12px]">Empties Added:</span>{" "}
              <span className="text-[12px] font-bold">
                {form.watch("empties_qty")} units @ ₦
                {form.watch("empties_price") || "0"} each
              </span>
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
                <Input
                  type="number"
                  placeholder="e.g. 4300"
                  {...field}
                  className="bg-[#F3F4F6] h-12"
                  min="0"
                />
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
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  {...field}
                  className="bg-[#F3F4F6] h-12"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selling Price per Piece (shown always, but can be optional) */}
        <FormField
          control={form.control}
          name="selling_price_pieces"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                Selling Price (Per Piece/Bottle)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 200"
                  {...field}
                  className="bg-[#F3F4F6] h-12"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col lg:flex-row items-center gap-4">
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

        <div className="flex items-center gap-4">
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
      </form>
    </Form>
  );
};

export default StockForm;
