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
import { updateStockWithMovement } from "@/actions/stores";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";

interface UpdateStockMovementDialogProps {
  stockId: string;
  onSuccess: () => void;
}

export function UpdateStockMovementDialog({
  stockId,
  onSuccess,
}: UpdateStockMovementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    action: "Added" as "Added" | "Removed",
    quantity: 0,
    empties_qty: 0,
    remark: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "remark" ? value : Number(value) || 0,
    }));
  };

  const handleActionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      action: value as "Added" | "Removed",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("authToken");

    if (!token) {
      toast.error("No authentication token found. Please log in.");
      return;
    }

    if (formData.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setLoading(true);

    const result = await updateStockWithMovement(stockId, formData, token);

    if (result.success) {
      toast.success(result.message || "Movement recorded successfully");
      setOpen(false);
      onSuccess();
    } else {
      toast.error(result.message || "Failed to record movement");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
         
          className="w-full py-5 md:py-6 text-white bg-[#0A2540] hover:bg-[#304c6a]"
        >
          Update with Movement
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-[500px] bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-clash font-semibold text-[#2F2F2F] dark:text-white">
            Record Stock Movement
          </DialogTitle>
          <DialogDescription className="text-[#9E9A9A]">
            Add or remove stock quantity and empties
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Action: Added / Removed */}
          <div className="space-y-2">
            <Label htmlFor="action">Movement Type</Label>
            <Select value={formData.action} onValueChange={handleActionChange}>
              <SelectTrigger className="py-5">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Added">Added</SelectItem>
                <SelectItem value="Removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
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

          {/* Empties Qty */}
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

          {/* Remark */}
          <div className="space-y-2">
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

          {/* Buttons */}
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
                  Recording...
                </>
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
