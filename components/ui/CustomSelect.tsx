import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function CustomSelect({
  label,
  options,
  placeholder = "Select an option",
  defaultValue,
  onChange,
  className = "",
}: CustomSelectProps) {
  return (
    <div className={` w-full items-center gap-1.5 ${className}`}>
      <Label htmlFor={label}>{label}</Label>
      <Select defaultValue={defaultValue} onValueChange={onChange}>
        <SelectTrigger id={label} className="rounded-sm h-full bg-light-gray">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="">
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
