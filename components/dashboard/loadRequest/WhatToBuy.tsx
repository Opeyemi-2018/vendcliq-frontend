import React from "react";
import Field from "@/components/ui/Field";

interface Item {
  name: string;
  quantity: string;
  tenure: string;
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
  return (
    <>
      <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
        What do you want to buy?
      </h3>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-3 gap-4 mb-4">
          <Field
            label="Item1"
            placeholder="Item name"
            onChange={(e) => onInputChange(index, e)}
          />
          <Field
            label="Quantity"
            placeholder="QTY"
            onChange={(e) => onInputChange(index, e)}
          />
          <Field
            label="Amount"
            placeholder="Amount"
            onChange={(e) => onInputChange(index, e)}
          />
        </div>
      ))}

      <div className="text-xl font-clash font-medium mt-6">
        Total: 5,000,000.00
      </div>

      <button
        onClick={onAddItem}
        className="mt-4 w-full p-3 bg-inherit border border-yellow-500 rounded-none hover:bg-inherit text-yellow-500"
      >
        + Add Item
      </button>

      <button
        onClick={onNext}
        className="mt-4 w-full p-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
      >
        Next
      </button>
    </>
  );
};

export default LoanStepOne;
