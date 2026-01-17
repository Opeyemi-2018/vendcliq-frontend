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
import { updateStock } from "@/actions/stores";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";

interface UpdateStockDialogProps {
  stockId: string;
  stockData: {
    cost_price: string;
    selling_price: string;
    selling_price_pieces: string;
    empties_price: string;
    exp_date: string;
    stock_alert_no: number;
    sku: string;
  };
  onSuccess: () => void;
}

export function UpdateStockDialog({
  stockId,
  stockData,
  onSuccess,
}: UpdateStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cost_price: parseFloat(stockData.cost_price) || 0,
    selling_price: parseFloat(stockData.selling_price) || 0,
    selling_price_pieces: parseFloat(stockData.selling_price_pieces) || 0,
    empties_price: parseFloat(stockData.empties_price) || 0,
    exp_date: stockData.exp_date || "",
    stock_alert_no: stockData.stock_alert_no || 0,
    sku: stockData.sku || "",
    remark: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sku" || name === "exp_date" || name === "remark"
          ? value
          : parseFloat(value) || 0,
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

    setLoading(true);

    const result = await updateStock(stockId, formData, token);

    if (result.success) {
      toast.success(result.message || "Stock updated successfully");
      setOpen(false);
      onSuccess();
    } else {
      toast.error(result.message || "Failed to update stock");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full py-5 md:py-6">
          Update Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-clash font-semibold text-[#2F2F2F] dark:text-white">
            Update {formData.sku}
          </DialogTitle>
          <DialogDescription className="text-[#9E9A9A]">
            Kindly fill the details either to add or remove
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price" className="text-sm font-medium">
                Cost Price
              </Label>
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
              <Label htmlFor="selling_price" className="text-sm font-medium">
                Selling Price
              </Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={handleChange}
                required
                className="py-5 bg-[#F9F9F9]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="selling_price_pieces"
                className="text-sm font-medium"
              >
                Price per Piece
              </Label>
              <Input
                id="selling_price_pieces"
                name="selling_price_pieces"
                type="number"
                step="0.01"
                value={formData.selling_price_pieces}
                onChange={handleChange}
                required
                className="py-5 bg-[#F9F9F9]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empties_price" className="text-sm font-medium">
                Empties Price
              </Label>
              <Input
                id="empties_price"
                name="empties_price"
                type="number"
                step="0.01"
                value={formData.empties_price}
                onChange={handleChange}
                required
                className="py-5 bg-[#F9F9F9]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp_date" className="text-sm font-medium">
                Expiry Date
              </Label>
              <Input
                id="exp_date"
                name="exp_date"
                type="date"
                value={formData.exp_date}
                onChange={handleChange}
                required
                className="py-5 bg-[#F9F9F9]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_alert_no" className="text-sm font-medium">
                Stock Alert Level
              </Label>
              <Input
                id="stock_alert_no"
                name="stock_alert_no"
                type="number"
                step="1"
                value={formData.stock_alert_no}
                onChange={handleChange}
                required
                className="py-5 bg-[#F9F9F9]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="text-sm font-medium">
              SKU
            </Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="py-5 bg-[#F9F9F9]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark" className="text-sm font-medium">
              Remark (Optional)
            </Label>
            <Input
              id="remark"
              name="remark"
              placeholder="Reason for update..."
              value={formData.remark}
              onChange={handleChange}
              className="py-5 bg-[#F9F9F9]"
            />
          </div>

          <div className="flex justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full bg-white"
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
                  <ClipLoader size={24} color="white" />
                  Updating...
                </>
              ) : (
                "Update Stock"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
