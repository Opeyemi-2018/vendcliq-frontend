import { IReusableInputProps } from "@/types";
import React from "react";
import { Input } from "./Input";
import { cn } from "@/lib/utils";
import { Label } from "./label";

const Field: React.FC<IReusableInputProps> = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  name,
  required,
  disabled,
  error,
  accept,
  readOnly,
}) => {
  return (
    <div className={cn(`flex flex-col space-y-2`, className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        accept={accept}
        readOnly={readOnly}
        className="border rounded-sm border-input-border h-12 text-sm text-black bg-light-gray px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default Field;
