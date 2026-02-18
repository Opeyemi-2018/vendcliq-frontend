/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { updateStock, updateStockWithMovement } from "@/actions/stores";

interface UpdateStockModalProps {
  stockId: string;
  productName: string; // ← passed from parent for title
  initialData: {
    cost_price: number;
    selling_price: number;
    selling_price_pieces: number;
    empties_price: number;
    exp_date: string;
    stock_alert_no: number;
    sku: string;
  };
  onSuccess: () => void;
  triggerButton?: React.ReactNode; // optional custom trigger (defaults to button)
}

export function UpdateStockModal({
  stockId,
  productName,
  initialData,
  onSuccess,
  triggerButton,
}: UpdateStockModalProps) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"update_stock" | "update_movement">(
    "update_stock",
  );
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Update Stock
    cost_price: initialData.cost_price,
    selling_price: initialData.selling_price,
    selling_price_pieces: initialData.selling_price_pieces,
    empties_price: initialData.empties_price,
    exp_date: initialData.exp_date,
    stock_alert_no: initialData.stock_alert_no,
    sku: initialData.sku,
    remark: "",

    // Movement
    movement_action: "Added" as "Added" | "Removed",
    quantity: 0,
    empties_qty: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("price") ||
        name === "quantity" ||
        name === "empties_qty" ||
        name === "stock_alert_no"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("authToken");

    if (!token) {
      toast.error("No authentication token found.");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (action === "update_stock") {
        const payload = {
          cost_price: formData.cost_price,
          selling_price: formData.selling_price,
          selling_price_pieces: formData.selling_price_pieces,
          empties_price: formData.empties_price,
          exp_date: formData.exp_date,
          stock_alert_no: formData.stock_alert_no,
          sku: formData.sku,
          remark: formData.remark,
        };
        result = await updateStock(stockId, payload, token);
      } else {
        if (formData.quantity <= 0) {
          toast.error("Quantity must be greater than 0");
          setLoading(false);
          return;
        }
        const payload = {
          action: formData.movement_action,
          quantity: formData.quantity,
          empties_qty: formData.empties_qty,
          remark: formData.remark,
        };
        result = await updateStockWithMovement(stockId, payload, token);
      }

      if (result.success) {
        toast.success(result.message || "Operation successful");
        onSuccess();
        setOpen(false);
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (err: any) {
      toast.error("An error occurred. Please try again.", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="w-full py-5 md:py-6">
            Update Stock
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-[600px] bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-clash font-semibold text-[#2F2F2F] dark:text-white">
            {productName}
          </DialogTitle>
          <DialogDescription className="text-[#9E9A9A]">
            Select action and fill in the details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Action Selector */}
          <div className="space-y-2">
            <Label htmlFor="action">Select Action</Label>
            <Select
              value={action}
              onValueChange={(val) => setAction(val as typeof action)}
            >
              <SelectTrigger className="py-5">
                <SelectValue placeholder="Choose action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update_stock">Update Price</SelectItem>
                <SelectItem value="update_movement">
                  Add / Remove Stock
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Fields */}
          {action === "update_stock" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input
                  id="cost_price"
                  name="cost_price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={handleChange}
                  required
                  className="py-5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price</Label>
                <Input
                  id="selling_price"
                  name="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={handleChange}
                  required
                  className="py-5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling_price_pieces">Price per Piece</Label>
                <Input
                  id="selling_price_pieces"
                  name="selling_price_pieces"
                  type="number"
                  step="0.01"
                  value={formData.selling_price_pieces}
                  onChange={handleChange}
                  required
                  className="py-5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empties_price">Empties Price</Label>
                <Input
                  id="empties_price"
                  name="empties_price"
                  type="number"
                  step="0.01"
                  value={formData.empties_price}
                  onChange={handleChange}
                  required
                  className="py-5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp_date">Expiry Date</Label>
                <Input
                  id="exp_date"
                  name="exp_date"
                  type="date"
                  value={formData.exp_date}
                  onChange={handleChange}
                  required
                  className="py-5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_alert_no">Stock Alert Level</Label>
                <Input
                  id="stock_alert_no"
                  name="stock_alert_no"
                  type="number"
                  value={formData.stock_alert_no}
                  onChange={handleChange}
                  required
                  className="py-5"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  className="py-5"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="remark">Remark (Optional)</Label>
                <Input
                  id="remark"
                  name="remark"
                  placeholder="Reason for update..."
                  value={formData.remark}
                  onChange={handleChange}
                  className="py-5"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="movement_action">Movement Type</Label>
                <Select
                  value={formData.movement_action}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      movement_action: val as "Added" | "Removed",
                    }))
                  }
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Added">Added</SelectItem>
                    <SelectItem value="Removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="py-5"
                  placeholder="e.g. 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empties_qty">Empties Quantity</Label>
                <Input
                  id="empties_qty"
                  name="empties_qty"
                  type="number"
                  min="0"
                  value={formData.empties_qty}
                  onChange={handleChange}
                  required
                  className="py-5"
                  placeholder="e.g. 10"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="remark">Remark (Optional)</Label>
                <Input
                  id="remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="e.g. Restocking from supplier"
                  className="py-5"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-between gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0A6DC0] hover:bg-[#09599a] w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <ClipLoader size={20} color="white" className="mr-2" />
                  {action === "update_stock" ? "Updating..." : "Recording..."}
                </>
              ) : action === "update_stock" ? (
                "Update Stock"
              ) : (
                "Record Movement"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
