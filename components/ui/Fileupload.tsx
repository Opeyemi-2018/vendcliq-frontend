"use client";

import React, { useState } from "react";
import { Input } from "./Input";
import { Label } from "@/components/ui/label";
import { Upload, File, X } from "lucide-react";

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  maxSize?: number;
  name?: string;
  onChange: (
    file: File | null,
    e?: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export function FileUpload({
  id,
  label,
  accept = ".png,.jpg,.jpeg,.pdf",
  maxSize = 5 * 1024 * 1024,
  name,
  onChange,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setError(null);

    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        setError(`File size should not exceed ${maxSize / 1024 / 1024}MB`);
        return;
      }
      setFile(selectedFile);
      onChange?.(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onChange?.(null);
  };

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          name={name}
        />
        <label
          htmlFor={id}
          className="flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-5 py-8 text-center hover:bg-gray-50"
        >
          {file ? (
            <div className="flex items-center space-x-2">
              <File className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-primary">
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveFile();
                }}
                className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <div className="mt-4 flex flex-col items-center">
                <span className="text-sm font-medium text-primary">
                  Click to upload
                </span>
                <span className="text-xs text-muted-foreground">
                  or drag and drop
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {accept.split(",").join(", ")} (max. {maxSize / 1024 / 1024}
                  MB)
                </span>
              </div>
            </>
          )}
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
