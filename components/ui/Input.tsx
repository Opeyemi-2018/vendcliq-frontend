import { IReusableInputProps } from "@/type";
import React from "react";

const Input: React.FC<IReusableInputProps> = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      <label className="mb-2 font-medium text-sm text-black">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border rounded-sm border-input-border h-14 text-sm text-black bg-light-gray px-3 py-2 focus:outline-none focus:border-0"
      />
    </div>
  );
};

export default Input;
