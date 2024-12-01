import { IReusableInputProps } from "@/types";
import React from "react";
import { Input } from "./Input";
import { cn } from "@/lib/utils";

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
    <div className={cn(`flex flex-col`, className)}>
      <label className="mb-2 font-medium text-sm text-black">{label}</label>
      <Input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        accept={accept}
        readOnly={readOnly}
        className="border rounded-sm border-input-border h-12 text-sm text-black bg-light-gray px-3 py-2 focus:outline-none focus:border-primary"
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};

export default Field;
