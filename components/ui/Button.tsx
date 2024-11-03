import cn from "@/lib/utils/cn";
import { IButton } from "@/type";
import React from "react";

export const Button = ({ children, className, action }: IButton) => {
  return (
    <button
      onClick={action}
      className={cn(
        "bg-primary font-sans w-full py-3 text-black rounded-sm",
        className
      )}
    >
      {children}
    </button>
  );
};
