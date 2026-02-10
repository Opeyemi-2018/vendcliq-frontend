/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { handleUpdateStockPrices } from "@/lib/utils/api/apiHelper";

interface EditStockPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: string;
  currentPrices: {
    selling_price: string;
    selling_price_pieces: string;
    empties_price: string;
  };
  onSuccess?: () => void;
}

const EditStockPriceModal: React.FC<EditStockPriceModalProps> = ({
  isOpen,
  onClose,
  stockId,
  currentPrices,
  onSuccess,
}) => {
  const [sellingPrice, setSellingPrice] = useState(
    currentPrices.selling_price || "",
  );
  const [sellingPricePieces, setSellingPricePieces] = useState(
    currentPrices.selling_price_pieces || "",
  );
  const [emptiesPrice, setEmptiesPrice] = useState(
    currentPrices.empties_price || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!sellingPrice || !sellingPricePieces) {
      toast.error("Selling price and selling price per piece are required");
      return;
    }

    const sellingPriceNum = parseFloat(sellingPrice);
    const sellingPricePiecesNum = parseFloat(sellingPricePieces);
    const emptiesPriceNum = parseFloat(emptiesPrice || "0");

    if (
      isNaN(sellingPriceNum) ||
      isNaN(sellingPricePiecesNum) ||
      sellingPriceNum <= 0 ||
      sellingPricePiecesNum <= 0
    ) {
      toast.error("Please enter valid prices");
      return;
    }

    if (emptiesPrice && isNaN(emptiesPriceNum)) {
      toast.error("Please enter a valid empties price");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        selling_price: sellingPriceNum,
        selling_price_pieces: sellingPricePiecesNum,
        empties_price: emptiesPriceNum,
      };

      const response = await handleUpdateStockPrices(stockId, payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Stock prices updated successfully!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.error || "Failed to update stock prices");
      }
    } catch (error: any) {
      console.error("Error updating stock prices:", error);
      toast.error(
        error.message || "Network/server error while updating prices",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset to original values
      setSellingPrice(currentPrices.selling_price || "");
      setSellingPricePieces(currentPrices.selling_price_pieces || "");
      setEmptiesPrice(currentPrices.empties_price || "");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#0E0E0F] font-bold font-clash text-[20px]">
            Edit Stock Prices
          </DialogTitle>
          <DialogDescription className="text-[#9E9A9A] font-dm-sans">
            Update the selling prices for this stock item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Selling Price (Packs/Crates) */}
          <div className="space-y-2">
            <Label
              htmlFor="selling_price"
              className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium"
            >
              Selling Price (Packs/Crates)
            </Label>
            <Input
              id="selling_price"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 5000"
              value={sellingPrice}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers and decimal point
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setSellingPrice(value);
                }
              }}
              className="bg-[#F3F4F6] h-12"
              disabled={isSubmitting}
            />
          </div>

          {/* Selling Price per Piece/Bottle */}
          <div className="space-y-2">
            <Label
              htmlFor="selling_price_pieces"
              className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium"
            >
              Selling Price (Per Piece/Bottle)
            </Label>
            <Input
              id="selling_price_pieces"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 200"
              value={sellingPricePieces}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setSellingPricePieces(value);
                }
              }}
              className="bg-[#F3F4F6] h-12"
              disabled={isSubmitting}
            />
          </div>

          {/* Empties Price */}
          <div className="space-y-2">
            <Label
              htmlFor="empties_price"
              className="text-[#2F2F2F] font-dm-sans text-[16px] font-medium"
            >
              Empties Price (Optional)
            </Label>
            <Input
              id="empties_price"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 50"
              value={emptiesPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setEmptiesPrice(value);
                }
              }}
              className="bg-[#F3F4F6] h-12"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-12"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#0A6DC0] hover:bg-[#085a9e] h-12"
          >
            {isSubmitting ? (
              <>
                Updating...{" "}
                <ClipLoader size={18} color="white" className="ml-2" />
              </>
            ) : (
              "Update Prices"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockPriceModal;