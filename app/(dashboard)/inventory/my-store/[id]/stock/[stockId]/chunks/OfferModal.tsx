/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { poster } from "@/lib/utils/api/apiHelper";
import { CREATE_OFFER } from "@/url/api-url";

interface CreatePromoModalProps {
  stockId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePromoModal({
  stockId,
  open,
  onOpenChange,
  onSuccess,
}: CreatePromoModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    qty: "",
    price: "",
    expiry_date: null as Date | null,
    minimum_qty: "",
    supply_fee: "",
  });

  const resetForm = () => {
    setForm({
      qty: "",
      price: "",
      expiry_date: null,
      minimum_qty: "",
      supply_fee: "",
    });
  };

  const handleSubmit = async () => {
    // Prevent double submission while loading
    if (loading) return;

    const { qty, price, expiry_date, minimum_qty, supply_fee } = form;

    if (!qty || !price || !expiry_date || !minimum_qty || !supply_fee) {
      toast.error("Please fill in all fields");
      return;
    }

    const qtyNum = parseInt(qty, 10);
    const priceNum = parseFloat(price);
    const minQtyNum = parseInt(minimum_qty, 10);
    const feeNum = parseFloat(supply_fee);

    if (isNaN(qtyNum) || isNaN(priceNum) || isNaN(minQtyNum) || isNaN(feeNum)) {
      toast.error("Please enter valid numbers");
      return;
    }

    if (qtyNum <= 0 || minQtyNum <= 0 || priceNum <= 0 || feeNum < 0) {
      toast.error("Quantities and prices must be positive");
      return;
    }

    if (expiry_date < new Date()) {
      toast.error("Expiry date must be in the future");
      return;
    }

    const payload = {
      stock_id: stockId,
      qty: qtyNum,
      price: priceNum,
      expiry_date: format(expiry_date, "yyyy-MM-dd"),
      minimum_qty: minQtyNum,
      supply_fee: feeNum,
    };

    setLoading(true);

    try {
      await poster(CREATE_OFFER, payload);
      // Only one success toast - here in the modal
      toast.success("Promo offer created successfully!");

      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess(); // can refresh data silently
    } catch (err: any) {
      const errorMsg =
        err?.error ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create promo offer";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-clash">
            Create New Promo Offer
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Row 1: Qty & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity Available for Promo</Label>
              <Input
                id="qty"
                type="number" className="bg-[#FAFAFA]"
                min="1"
                placeholder="e.g. 50"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Promo Price per Unit (₦)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"  className="bg-[#FAFAFA]"
                placeholder="e.g. 1500.50"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Min Qty & Supply Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_qty">Minimum Purchase Qty</Label>
              <Input
                id="minimum_qty"
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={form.minimum_qty} className="bg-[#FAFAFA]"
                onChange={(e) =>
                  setForm({ ...form, minimum_qty: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supply_fee">Supply Fee (₦)</Label>
              <Input
                id="supply_fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 200" className="bg-[#FAFAFA]"
                value={form.supply_fee}
                onChange={(e) =>
                  setForm({ ...form, supply_fee: e.target.value })
                }
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.expiry_date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.expiry_date
                    ? format(form.expiry_date, "PPP")
                    : "Select expiry date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.expiry_date ?? undefined}
                  onSelect={(date) =>
                    setForm({ ...form, expiry_date: date || null })
                  }
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto bg-[#0A6DC0] hover:bg-[#085a9e]"
          >
            {loading ? "Creating Promo..." : "Create Promo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
