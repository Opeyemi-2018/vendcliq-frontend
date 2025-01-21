import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { BsSortUpAlt } from "react-icons/bs";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
interface FilterSortDropdownProps {
  onFilterChange: (filter: string) => void;
  onSortChange: (sortOrder: "asc" | "desc") => void;
}

const FilterSortDropdown: React.FC<FilterSortDropdownProps> = ({
  onFilterChange,
  onSortChange,
}) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Ascending");

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter === "All" ? "All" : filter);
    onFilterChange(filter);
  };

  const handleSortSelect = (sortOrder: "asc" | "desc") => {
    setSelectedSort(sortOrder === "asc" ? "Ascending" : "Descending");
    onSortChange(sortOrder);
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg border-gray-300 shadow-sm bg-white">
      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-gray-700 text-sm font-medium px-2">
          <TbAdjustmentsHorizontal size="20" className="mr-1 text-black" />
          {selectedFilter}
          <MdOutlineKeyboardArrowDown size="16" className="ml-1 text-black" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-2 z-50">
          <DropdownMenuItem
            onClick={() => handleFilterSelect("All")}
            className="hover:bg-gray-100 text-sm py-2 px-3 hover:cursor-pointer"
          >
            All
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleFilterSelect("Incoming")}
            className="hover:bg-gray-100 text-sm py-2 px-3 hover:cursor-pointer"
          >
            Incoming
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleFilterSelect("Outgoing")}
            className="hover:bg-gray-100 text-sm py-2 px-3 hover:cursor-pointer"
          >
            Outgoing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="border-l h-6" />

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-gray-700 text-sm font-medium px-2">
          <BsSortUpAlt size="20" className="mr-1 text-black" />
          {selectedSort}
          <MdOutlineKeyboardArrowDown size="16" className="ml-1 text-black" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-2 z-50">
          <DropdownMenuItem
            onClick={() => handleSortSelect("asc")}
            className="hover:bg-gray-100 text-sm py-2 px-3 hover:cursor-pointer"
          >
            Ascending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSortSelect("desc")}
            className="hover:bg-gray-100 text-sm py-2 px-3 hover:cursor-pointer"
          >
            Descending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterSortDropdown;
