import { cn } from "@/lib/utils";
import { DocumentText1 } from "iconsax-react";
import React from "react";

export const StatCard = ({
  title,
  count,
  className,
  color,
}: {
  title: string;
  count: number;
  className?: string;
  color: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-start bg-white flex-1 p-5 gap-2 font-sans rounded-xl border  border-[#DBDBDB]",
        className
      )}
    >
      <DocumentText1 size="24" color={color} />

      <div>
        <p className={`font-medium text-[${color}]`}>{title}</p>
        <p className="text-black">{count}</p>
      </div>
    </div>
  );
};
