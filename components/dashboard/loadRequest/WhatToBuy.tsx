import React, { useContext } from "react";
import Field from "@/components/ui/Field";
import { RequestContext } from "./RequestContext";

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
}

const LoanStepOne: React.FC<LoanStepOneProps> = ({
  items,
  onAddItem,
  onNext,
  onInputChange,
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
    console.log(items);
    onNext();
  };

  return (
    <div className="w-full ">
      <h3 className="text-lg sm:text-xl font-medium border-b border-border pb-2 font-clash mb-4 sm:mb-8">
        What do you want to buy?
      </h3>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field
            name="name"
            label="Item"
            placeholder="Item name"
            type="text"
            onChange={(e) => onInputChange(index, e)}
          />
          <Field
            name="quantity"
            label="Quantity"
            placeholder="QTY"
            type="number"
            onChange={(e) => onInputChange(index, e)}
          />
          <Field
            name="amount"
            label="Amount"
            placeholder="Amount"
            type="number"
            onChange={(e) => onInputChange(index, e)}
          />
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
