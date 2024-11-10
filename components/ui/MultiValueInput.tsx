"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import { X, Plus } from "lucide-react";
import { Input } from "./Input";

export default function MultiValueInput({ label }: { label: string }) {
  const [shareholders, setShareholders] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addData = () => {
    if (inputValue.trim() && !shareholders.includes(inputValue.trim())) {
      setShareholders([...shareholders, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeData = (index: number) => {
    setShareholders(shareholders.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-4">
      <label className="mb-2 font-medium text-sm text-black">{label}</label>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
        {shareholders.map((shareholder, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-3 py-1 bg-muted rounded-md"
          >
            <span className="text-sm">{shareholder}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={() => removeData(index)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove {shareholder}</span>
            </Button>
          </div>
        ))}
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addData();
              }
            }}
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Enter shareholder name"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={addData}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add new
          </Button>
        </div>
      </div>
    </div>
  );
}
