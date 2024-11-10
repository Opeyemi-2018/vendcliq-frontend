import { cn } from "@/lib/utils";
import React from "react";
import { PiNoteDuotone } from "react-icons/pi";
export const StatCard = ({
  title,
  count,
  className,
}: {
  title: string;
  count: number;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-start bg-white flex-1 p-5 gap-2 font-sans rounded-xl",
        className
      )}
    >
      <PiNoteDuotone size={20} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-black">{count}</p>
      </div>
    </div>
  );
};
