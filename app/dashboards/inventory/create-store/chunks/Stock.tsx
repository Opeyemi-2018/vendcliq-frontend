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
import {
  createStockSchema,
  CreateStockFormData,
  Product,
} from "@/types/stock";
import { Card } from "@/components/ui/card";
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
import { Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { handleCreateStock } from "@/lib/utils/api/apiHelper";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProduct";

interface StockProps {
  storeId: string;
}

const Stock: React.FC<StockProps> = ({ storeId }) => {
  const { products, isLoading: loadingProducts } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmptiesModalOpen, setIsEmptiesModalOpen] = useState(false);
  const [tempEmptiesQty, setTempEmptiesQty] = useState("");
  const [tempEmptiesPrice, setTempEmptiesPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  // Handle product selection change
  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);

    if (product) {
      const skuWords = product.name
        .split(" ")
        .slice(0, 3)
        .join(" ")
        .toUpperCase();
      form.setValue("sku", skuWords);
    } else {
      form.setValue("sku", "");
    }

    form.setValue("product_id", productId);
  };

  const handleSaveEmpties = () => {
    if (!tempEmptiesQty || !tempEmptiesPrice) {
      toast.error("Please enter both empties quantity and price");
      return;
    }
    form.setValue("empties_qty", tempEmptiesQty);
    form.setValue("empties_price", tempEmptiesPrice);
    setIsEmptiesModalOpen(false);
    toast.success("Empties added successfully");
    setTempEmptiesQty("");
    setTempEmptiesPrice("");
  };

  const onSubmit = async (values: CreateStockFormData) => {
    setIsSubmitting(true);

    const payload = {
      product_id: values.product_id,
      store_id: storeId,
      quantity: parseInt(values.quantity, 10),
      empties_qty: parseInt(values.empties_qty || "0", 10),
      cost_price: parseFloat(values.cost_price),
      selling_price: parseFloat(values.selling_price),
      selling_price_pieces: parseFloat(values.selling_price_pieces || "0"),
      empties_price: parseFloat(values.empties_price || "0"),
      exp_date: values.exp_date,
      sku: values.sku || "",
      stock_alert_no: parseInt(values.stock_alert_no, 10),
      attributes: {
        type: values.type,
        batch: values.batch || "",
        supplier: values.supplier || "",
      },
    };

    console.log("Stock Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await handleCreateStock(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Stock added successfully!");
        form.reset();
        router.push("/dashboards/inventory/my-store");
        setSelectedProduct(null);
      } else {
        toast.error(response.error || "Failed to add stock. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating stock:", error);
      toast.error(error.message || "Failed to add stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Card className="p-6 max-w-[50rem] mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-[18px] text-[#2F2F2F] font-semibold font-clash">
            Add New Stock
          </h2>
          <span className="text-sm text-gray-500">(Store ID: {storeId})</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Selection */}
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium">
                    Select Product
                  </FormLabel>
                  <Select
                    onValueChange={handleProductChange}
                    defaultValue={field.value}
                    disabled={loadingProducts}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#F3F4F6] h-12">
                        <SelectValue
                          placeholder={
                            loadingProducts
                              ? "Loading products..."
                              : "Select a product"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {products.length === 0 ? (
                        <SelectItem value="no-products" disabled>
                          {loadingProducts
                            ? "Loading..."
                            : "No products available"}
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id}
                            className="py-3"
                          >
                            <div className="flex items-center gap-3">
                              {product.image && (
                                <div className="relative w-10 h-10 flex-shrink-0">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded"
                                    sizes="40px"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-medium text-[#2F2F2F]">
                                  {product.name}
                                </span>
                                <span className="text-sm text-[#6B7280]">
                                  {product.productType} • {product.sizeCl}cl •{" "}
                                  {product.containerType}
                                </span>
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
                              onChange={(e) =>
                                setTempEmptiesQty(e.target.value)
                              }
                              className="mt-2 h-12"
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
                              onChange={(e) =>
                                setTempEmptiesPrice(e.target.value)
                              }
                              className="mt-2 h-12"
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Empties Preview */}
            {form.watch("empties_qty") &&
              form.watch("empties_qty") !== "0" &&
              form.watch("empties_qty") !== "" && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-[#2F2F2F] font-medium">
                    <strong>Empties Added:</strong> {form.watch("empties_qty")}{" "}
                    units @ ₦{form.watch("empties_price")} each
                  </p>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selling Price Pieces (Optional) */}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Batch */}
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                      Batch Number
                    </FormLabel>
                    <FormControl className="">
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

            <div className="flex items-center gap-4">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SKU - Auto-generated from product */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] text-[16px] font-medium">
                    SKU (Auto-generated)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Will be auto-generated when you select a product"
                      {...field}
                      className="bg-[#F3F4F6] h-12"
                      readOnly
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    SKU is automatically generated from the product name
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
      </Card>
    </div>
  );
};

export default Stock;