import { Button } from "@/components/ui/button";
import React from "react";
type OptionType = "Vendcilo" | "Other Banks";

interface TransferSidebarProps {
  selectedOption: OptionType;
  onSelect: (option: OptionType) => void;
}
const TransferSidebar: React.FC<TransferSidebarProps> = ({
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="p-4 bg-white h-fit flex flex-col space-y-4">
      {/* Transfer to Vera Button */}
      <Button
        onClick={() => onSelect("Vendcilo")}
        className={`py-2 w-fit px-4 text-left rounded-none font-semibold transition-colors ${
          selectedOption === "Vendcilo"
            ? "bg-yellow-500 text-white"
            : "bg-white text-black border border-gray-300"
        }`}
      >
        Transfer to Vendcilq
      </Button>

      {/* Transfer to Other Banks Button */}
      <Button
        onClick={() => onSelect("Other Banks")}
        className={`py-2 px-4 w-fit text-left rounded-none font-semibold transition-colors ${
          selectedOption === "Other Banks"
            ? "bg-yellow-500 text-white"
            : "bg-white text-black border border-gray-300"
        }`}
      >
        Transfer to Other Banks
      </Button>
    </div>
  );
};

export default TransferSidebar;
