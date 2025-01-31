import React, { useContext } from "react";
import Field from "@/components/ui/Field";
import { RequestContext } from "./RequestContext";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";

import { useGetInventory } from "@/services/loan/loan";
import { IoCloseOutline } from "react-icons/io5";
import ComboBox from "@/components/ui/ComboBox";

interface Item {
  name: string;
  quantity: string;
  amount: string;
}

interface LoanStepOneProps {
  items: Item[];
  onAddItem: () => void;
  onNext: () => void;
  onInputChange: (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onRemoveItem: (index: number) => void;
}

const LoanStepOne: React.FC<LoanStepOneProps> = ({
  items,
  onAddItem,
  onNext,
  onInputChange,
  onRemoveItem,
}) => {
  const { setItems } = useContext(RequestContext);

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => {
        const quantity = parseInt(item.quantity) || 0;
        const amount = parseFloat(item.amount) || 0;
        return sum + quantity * amount;
      }, 0)
      .toLocaleString("en-NG", { style: "currency", currency: "NGN" });
  };

  const isStepValid = () => {
    return items.every(
      (item) =>
        item.name.trim() && item.quantity.trim() && parseFloat(item.amount) > 0
    );
  };

  const handleNext = () => {
    if (setItems) {
      const transformedItems = items.map((item) => ({
        item: item.name,
        quantity: parseInt(item.quantity) || 0,
        amount: parseFloat(item.amount) || 0,
      }));
      setItems(transformedItems);
    }
    // console.log(items);
    onNext();
  };
  const inventory = useGetInventory();

  // Format inventory options for ComboBox
  const inventoryOptions =
    inventory.results?.map((item) => ({
      label: item.name,
      value: item.name,
    })) || [];

  return (
    <div className="w-full bg-white p-6">
      <h3 className="text-lg sm:text-xl font-medium border-b border-border pb-2 font-clash mb-4 sm:mb-8">
        {/* What do you want to buy? */}
      </h3>

      {items.map((item, index) => (
        <div
          key={index}
          className="flex w-full justify-between items-center gap-4 mb-4"
        >
          <div className="flex flex-col w-full">
            <label className="font-medium text-sm text-black pb-1">
              Item {index + 1}
            </label>
            <div className="h-12">
              <ComboBox
                options={inventoryOptions}
                value={
                  item.name ? { label: item.name, value: item.name } : undefined
                }
                onChange={(option) =>
                  onInputChange(index, {
                    target: { name: "name", value: option.value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                placeholder="Search for an item..."
                label="Select Item"
              />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <Field
              name="quantity"
              label="Quantity"
              placeholder="QTY"
              type="number"
              onChange={(e) => onInputChange(index, e)}
            />
          </div>
          <div className="flex flex-col w-full">
            <Field
              name="amount"
              label="Amount"
              placeholder="Amount"
              type="number"
              onChange={(e) => onInputChange(index, e)}
            />
          </div>
          <div className="flex flex-col w-10">
            <IoCloseOutline
              size={20}
              className="text-red-500 cursor-pointer "
              onClick={() => onRemoveItem(index)}
            />
          </div>
        </div>
      ))}

      <div className="text-lg sm:text-xl font-clash font-medium mt-4 sm:mt-6">
        Total: {calculateTotal()}
      </div>

      <button
        onClick={onAddItem}
        className="mt-4 w-full p-3 bg-inherit border border-yellow-500 rounded-md hover:bg-yellow-50 text-yellow-500"
      >
        + Add Item
      </button>

      <button
        onClick={handleNext}
        className={`mt-4 w-full p-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 ${
          !isStepValid() ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default LoanStepOne;
