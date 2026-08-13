"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VcIcon, IconName } from "./VcIcon";

interface AddNewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** New Product opens the Add Stock sheet rather than navigating. */
  onAddProduct?: () => void;
}

const OPTIONS: {
  id: string;
  label: string;
  sub: string;
  route: string;
  icon: IconName;
  bg: string;
  fg: string;
}[] = [
  {
    id: "product",
    label: "New Product",
    sub: "Add stock to one of your stores",
    route: "/inventory/my-store",
    icon: "bottle",
    bg: "#E1EEFF",
    fg: "#0A6DC0",
  },
  {
    id: "store",
    label: "New Store",
    sub: "Open another branch or outlet",
    route: "/inventory/create-store",
    icon: "shop",
    bg: "#E8EEFF",
    fg: "#4052A3",
  },
  {
    id: "attendant",
    label: "New Attendant",
    sub: "Invite a staff member to sell",
    route: "/inventory/add-attendant",
    icon: "people",
    bg: "#E0F2ED",
    fg: "#148264",
  },
];

/** The three things "Add New" can mean, per §7. */
export const AddNewSheet = ({
  open,
  onOpenChange,
  onAddProduct,
}: AddNewSheetProps) => {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[460px] font-dm-sans text-[#2F2F2F] rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="font-clash font-bold text-[22px] tracking-[-.4px]">
            Add new
          </DialogTitle>
          <p className="text-[13.5px] text-[#8E8E93]">
            What would you like to add to your business?
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-1">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (option.id === "product" && onAddProduct) {
                  onAddProduct();
                  return;
                }
                onOpenChange(false);
                router.push(option.route);
              }}
              className="flex items-center gap-[14px] w-full text-left cursor-pointer px-4 py-[14px] rounded-[14px] border border-[#D8D8D8CC] bg-white hover:border-[#0A6DC0] hover:bg-[#F9FCFF] transition"
            >
              <span
                className="w-11 h-11 rounded-[13px] inline-flex items-center justify-center shrink-0"
                style={{ background: option.bg }}
              >
                <VcIcon name={option.icon} size={22} stroke={option.fg} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-[15px] text-[#2F2F2F] tracking-[-.2px]">
                  {option.label}
                </span>
                <span className="block text-[12.5px] text-[#8E8E93] mt-0.5">
                  {option.sub}
                </span>
              </span>
              <VcIcon
                name="chevron"
                size={18}
                stroke="#B9BCC2"
                strokeWidth={2.4}
                className="shrink-0"
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewSheet;
