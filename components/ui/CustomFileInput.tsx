"use client";

import * as React from "react";
import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";

export default function CustomFileInput({ label }: { label: string }) {
  const [file, setFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <label className="mb-2 font-medium text-sm text-black">{label}</label>
      <div
        onClick={handleClick}
        className="flex items-center justify-between w-full  text-sm border rounded-lg cursor-pointer hover:bg-muted/50"
      >
        <div className="flex items-center  bg-light-gray px-3   gap-2 h-12  text-muted-foreground justify-between w-full">
          {file ? file.name : "Driver's License"}
          <p className="text-[#146421] bg-[#00C53A] py-0.5 rounded-md px-3">
            uploaded
          </p>
        </div>
        {file && (
          <div className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-600 bg-green-100 rounded">
            <Check className="w-3 h-3" />
            Uploaded
          </div>
        )}
        <Input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
