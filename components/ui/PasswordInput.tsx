"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function PasswordInput({
  placeholder,
  label,
  disabled,
  value,
  onChange,
  required,
  error,
  className,
}: {
  placeholder: string;
  label: string;
  disabled?: boolean;
  value: string;
  required?: boolean;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Label htmlFor="password">{label}</Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          className="pr-10 border rounded-sm w-full border-input-border h-12 text-sm text-black bg-light-gray"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
}
