import React, { useState } from "react";

import { ArrowDown2, Filter } from "iconsax-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

interface FilterSortDropdownProps {
  onFilterChange: (filter: string) => void;
  onSortChange: (sortOrder: "asc" | "desc") => void;
}

const FilterSortDropdown: React.FC<FilterSortDropdownProps> = ({
  onFilterChange,
  onSortChange,
}) => {
  const [selectedFilter, setSelectedFilter] = useState("Filters");
  const [selectedSort, setSelectedSort] = useState("Sorts");

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter === "All" ? "Filters" : filter);
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
          <Filter size="20" className="mr-1" />
          {selectedFilter}
          <ArrowDown2 size="16" className="ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <DropdownMenuItem onClick={() => handleFilterSelect("All")}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("Incoming")}>
            Incoming
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("Outgoing")}>
            Outgoing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="border-l h-6" />

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-gray-700 text-sm font-medium px-2">
          <ArrowDown2 size="20" className="mr-1" />
          {selectedSort}
          <ArrowDown2 size="16" className="ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <DropdownMenuItem onClick={() => handleSortSelect("asc")}>
            Ascending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortSelect("desc")}>
            Descending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterSortDropdown;
