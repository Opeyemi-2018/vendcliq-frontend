import { cn } from "@/lib/utils";
import React from "react";

export const PageTitle = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <div className="w-full">
      <h2 className={cn("font-semibold text-2xl ", className)}>{title}</h2>
    </div>
  );
};
