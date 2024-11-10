import { Search } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Input } from "./Input";

export function SearchInput({
  className,
}: {
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full ">
      <Input
        type="text"
        placeholder="Search References"
        className={twMerge(
          "pl-10 pr-12 py-2 rounded-full border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50",
          className
        )}
      />
      <div className="absolute inset-y-0 left-3 flex items-center pr-3">
        <div className=" p-1 rounded-full">
          <Search className="h-4 w-4 text-black" />
        </div>
      </div>
    </div>
  );
}
