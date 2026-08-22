import React, { useState } from "react";
import { X, Calculator, RotateCcw, Minus, Plus, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

interface CalculatorWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscountSelect?: (discount: number) => void;
  currentItemPrice?: number;
}

export default function CalculatorWidget({
  isOpen,
  onClose,
  onDiscountSelect,
  currentItemPrice = 0,
}: CalculatorWidgetProps) {
  const [mode, setMode] = useState<"normal" | "discount">("normal");

  // Normal Calculator State
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [fullExpression, setFullExpression] = useState<string>("0");

  // Discount Calculator State
  const [originalPrice, setOriginalPrice] = useState<string>(
    currentItemPrice ? String(currentItemPrice) : ""
  );
  const [discountPerUnit, setDiscountPerUnit] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [showCalculation, setShowCalculation] = useState(false);

  // ─── Normal Calculator Functions ───────────────────────────────────────
  const handleNumberClick = (num: string) => {
    if (waitingForNewValue) {
      // First digit after an operator
      setDisplay(num);
      setFullExpression(fullExpression + num);
      setWaitingForNewValue(false);
    } else {
      // Continuing to type more digits
      const newDisplay = display === "0" ? num : display + num;
      setDisplay(newDisplay);
      
      // Update the last number in the full expression with proper regex
      // This handles: "100 ÷ 2" → click 0 → "100 ÷ 20"
      const newExpression = fullExpression.replace(/\d+$/, newDisplay);
      setFullExpression(newExpression);
    }
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      const newDisplay = display + ".";
      setDisplay(newDisplay);
      setFullExpression(fullExpression + ".");
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = performCalculation(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    // Format operator symbol for display
    const opSymbol = op === "*" ? "×" : op === "/" ? "÷" : op;
    setFullExpression(fullExpression + " " + opSymbol + " ");
    setOperation(op);
    setWaitingForNewValue(true);
  };

  const performCalculation = (
    prev: number,
    current: number,
    op: string
  ): number => {
    switch (op) {
      case "+":
        return prev + current;
      case "-":
        return prev - current;
      case "*":
        return prev * current;
      case "/":
        return prev / current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const currentValue = parseFloat(display);
      const result = performCalculation(previousValue, currentValue, operation);
      setDisplay(String(result));
      setFullExpression(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setFullExpression("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  // Format numbers with comma separators
  const formatNumberDisplay = (expression: string): string => {
    // Handle expressions with operators
    if (expression.includes(" + ") || expression.includes(" - ") || expression.includes(" × ") || expression.includes(" ÷ ")) {
      // Split by operators, format each number, rejoin
      return expression
        .replace(/(\d+)/g, (match) => {
          const num = parseInt(match);
          return num.toLocaleString("en-NG");
        });
    }
    
    // For simple numbers (no decimals or operators)
    if (!expression.includes(".")) {
      const numValue = parseFloat(expression);
      if (!isNaN(numValue) && numValue !== 0) {
        return numValue.toLocaleString("en-NG");
      }
    }
    
    return expression;
  };

  // ─── Discount Calculator Functions (Quantity-Based) ───────────────────────
  /**
   * Discount Calculator Logic:
   * Original Price (per unit) = ₦100
   * Discount per unit = ₦10
   * Quantity = 2
   * 
   * Calculations:
   * - Total Discount = Discount per unit × Quantity = ₦10 × 2 = ₦20
   * - Final Price = (Original Price × Quantity) - Total Discount
   * - Final Price = (₦100 × 2) - ₦20 = ₦180
   */

  const handleOriginalPriceChange = (value: string) => {
    setOriginalPrice(value);
  };

  const handleDiscountPerUnitChange = (value: string) => {
    setDiscountPerUnit(value);
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseFloat(value) || 1;
    setQuantity(String(Math.max(1, numValue)));
  };

  const handleClearDiscount = () => {
    setOriginalPrice(currentItemPrice ? String(currentItemPrice) : "");
    setDiscountPerUnit("");
    setQuantity("1");
    setShowCalculation(false);
  };

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountPerUnit) || 0;
    const price = parseFloat(originalPrice) || 0;
    
    // First validation - must have price and discount entered
    if (price <= 0 || discount <= 0) {
      return;
    }
    
    // If not yet shown calculation, show it first
    if (!showCalculation) {
      setShowCalculation(true);
      return;
    }
    
    // If calculation already shown, apply discount and close
    if (onDiscountSelect) {
      onDiscountSelect(discount);
      onClose();
      setShowCalculation(false);
    }
  };

  // Calculations for discount display
  const price = parseFloat(originalPrice) || 0;
  const discountUnit = parseFloat(discountPerUnit) || 0;
  const qty = parseFloat(quantity) || 1;
  
  const totalDiscount = discountUnit * qty;
  const subtotal = price * qty;
  const finalPrice = Math.max(0, subtotal - totalDiscount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
          <p className="font-bold text-[#2F2F2F]">Calculator</p>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-[#9E9A9A]" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-4 border-b border-[#F0F0F0] flex gap-2">
          <button
            onClick={() => setMode("normal")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-6 ${
              mode === "normal"
                ? "bg-[#0A6DC0] border-[#0A6DC0] text-white"
                : "bg-white border-[#E4E4E4] text-[#2F2F2F]"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Calculator
          </button>
          <button
            onClick={() => setMode("discount")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-6 ${
              mode === "discount"
                ? "bg-[#0A6DC0] border-[#0A6DC0] text-white"
                : "bg-white border-[#E4E4E4] text-[#2F2F2F]"
            }`}
          >
            <Percent className="w-4 h-4"/>
            Discount
          </button>
        </div>

        {/* Normal Calculator Mode */}
        {mode === "normal" && (
          <div className="p-4 space-y-3">
            {/* Display */}
            <div className="bg-[#F5F6FA] rounded-lg p-4 text-right min-h-16 flex items-center justify-end">
              <p className="text-3xl font-bold text-[#2F2F2F] break-words">
                {formatNumberDisplay(fullExpression)}
              </p>
            </div>

            {/* Calculator Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <button
                onClick={handleClear}
                className="col-span-2 py-3 rounded-lg bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => handleOperation("/")}
                className="py-3 rounded-lg bg-[#0A6DC0] text-white font-semibold hover:bg-[#09599a] transition-all"
              >
                ÷
              </button>
              <button
                onClick={() => handleOperation("*")}
                className="py-3 rounded-lg bg-[#0A6DC0] text-white font-semibold hover:bg-[#09599a] transition-all"
              >
                ×
              </button>

              {/* Row 2 */}
              <button
                onClick={() => handleNumberClick("7")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                7
              </button>
              <button
                onClick={() => handleNumberClick("8")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                8
              </button>
              <button
                onClick={() => handleNumberClick("9")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                9
              </button>
              <button
                onClick={() => handleOperation("-")}
                className="py-3 rounded-lg bg-[#0A6DC0] text-white font-semibold hover:bg-[#09599a] transition-all"
              >
                −
              </button>

              {/* Row 3 */}
              <button
                onClick={() => handleNumberClick("4")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                4
              </button>
              <button
                onClick={() => handleNumberClick("5")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                5
              </button>
              <button
                onClick={() => handleNumberClick("6")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                6
              </button>
              <button
                onClick={() => handleOperation("+")}
                className="py-3 rounded-lg bg-[#0A6DC0] text-white font-semibold hover:bg-[#09599a] transition-all"
              >
                +
              </button>

              {/* Row 4 */}
              <button
                onClick={() => handleNumberClick("1")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                1
              </button>
              <button
                onClick={() => handleNumberClick("2")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                2
              </button>
              <button
                onClick={() => handleNumberClick("3")}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                3
              </button>
              <button
                onClick={handleEquals}
                className="py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-all row-span-2"
              >
                =
              </button>

              {/* Row 5 */}
              <button
                onClick={() => handleNumberClick("0")}
                className="col-span-2 py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                0
              </button>
              <button
                onClick={handleDecimal}
                className="py-3 rounded-lg bg-[#F5F6FA] text-[#2F2F2F] font-semibold hover:bg-gray-200 transition-all"
              >
                .
              </button>
            </div>
          </div>
        )}

        {/* Discount Calculator Mode - Quantity Based */}
        {mode === "discount" && (
          <div className="p-4 space-y-3">
            {/* Info Box - Minimal */}
            <div className="text-xs text-[#E89500] font-medium text-center">
             Discount per item × quantity
            </div>

            {/* Original Price Per Unit */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#2F2F2F]">
                Price Per Unit (₦)
              </label>
              <Input
                type="number"
                placeholder="e.g., 100"
                value={originalPrice}
                onChange={(e) => handleOriginalPriceChange(e.target.value)}
                className="border-[#E4E4E4] h-10"
              />
              {price > 0 && (
                <p className="text-xs text-[#9E9A9A]">
                  ₦{price.toLocaleString("en-NG")}
                </p>
              )}
            </div>

            {/* Discount Per Unit */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#2F2F2F]">
                Discount Per Unit (₦)
              </label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={discountPerUnit}
                onChange={(e) => handleDiscountPerUnitChange(e.target.value)}
                className="border-[#E4E4E4] h-10"
              />
              {discountUnit > 0 && (
                <p className="text-xs text-[#9E9A9A]">
                  ₦{discountUnit.toLocaleString("en-NG", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })} off per item
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#2F2F2F]">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setQuantity(String(Math.max(1, qty - 1)))
                  }
                  className="w-10 h-10 rounded-lg border border-[#E4E4E4] flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="border-[#E4E4E4] h-10 text-center"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(String(qty + 1))}
                  className="w-10 h-10 rounded-lg border border-[#E4E4E4] flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calculation Summary - Only show AFTER clicking Apply */}
            {showCalculation && (price > 0 || discountUnit > 0) && (
              <div className="bg-[#EEF5FB] rounded-lg p-3 space-y-2">
                <div className="space-y-2">
                  <div className="text-xs text-[#9E9A9A] font-medium mb-2">
                    CALCULATION BREAKDOWN:
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2F2F2F]">
                      Subtotal ({qty} × ₦{price.toLocaleString("en-NG")})
                    </span>
                    <span className="font-semibold text-[#2F2F2F]">
                      ₦{subtotal.toLocaleString("en-NG", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {/* Total Discount */}
                  {discountUnit > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#E89500]">
                        Total Discount ({qty} × ₦{discountUnit.toLocaleString("en-NG")})
                      </span>
                      <span className="font-semibold text-[#E89500]">
                        -₦{totalDiscount.toLocaleString("en-NG", {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Price */}
                <div className="border-t border-[#0A6DC0]/20 pt-2 flex justify-between">
                  <span className="text-sm font-bold text-[#2F2F2F]">
                    Amount Payable
                  </span>
                  <span className="font-bold text-[#0A6DC0] text-lg">
                    ₦{finalPrice.toLocaleString("en-NG", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Clear Button */}
            <button
              onClick={handleClearDiscount}
              className="w-full py-2 rounded-lg bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#F0F0F0] flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
          {mode === "discount" && (
            <Button
              onClick={handleApplyDiscount}
              disabled={!discountPerUnit || parseFloat(discountPerUnit) <= 0 || !originalPrice || parseFloat(originalPrice) <= 0}
              className="flex-1 bg-[#0A6DC0] hover:bg-[#09599a] text-white"
            >
              {showCalculation ? "Apply Discount" : "Show Calculation"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}