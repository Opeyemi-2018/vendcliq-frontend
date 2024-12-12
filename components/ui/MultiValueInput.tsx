"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Input } from "./Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Shareholder {
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  bank_verification_number: string;
}

export default function MultiValueInput({
  label,
  onChange,
}: {
  label: string;
  onChange?: (shareholders: Shareholder[]) => void;
}) {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [newShareholder, setNewShareholder] = useState<Shareholder>({
    firstname: "",
    lastname: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    bank_verification_number: "",
  });
  const [open, setOpen] = useState(false);

  const addShareholder = () => {
    setShareholders([...shareholders, newShareholder]);
    setNewShareholder({
      firstname: "",
      lastname: "",
      gender: "",
      date_of_birth: "",
      phone: "",
      bank_verification_number: "",
    });
    onChange?.([...shareholders, newShareholder]);
    setOpen(false);
  };

  const removeShareholder = (index: number) => {
    const updatedShareholders = shareholders.filter((_, i) => i !== index);
    setShareholders(updatedShareholders);
    onChange?.(updatedShareholders);
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
            <span className="text-sm">{`${shareholder.firstname} ${shareholder.lastname}`}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={() => removeShareholder(index)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove {shareholder.firstname}</span>
            </Button>
          </div>
        ))}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add new shareholder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Shareholder</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addShareholder();
              }}
              className="space-y-4"
            >
              {Object.keys(newShareholder).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                  {key === "gender" ? (
                    <Select
                      value={newShareholder.gender}
                      onValueChange={(value) =>
                        setNewShareholder({ ...newShareholder, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : key === "date_of_birth" ? (
                    <Input
                      id={key}
                      type="date"
                      value={newShareholder[key as keyof Shareholder]}
                      onChange={(e) =>
                        setNewShareholder({
                          ...newShareholder,
                          [key]: e.target.value,
                        })
                      }
                      required
                    />
                  ) : (
                    <Input
                      id={key}
                      value={newShareholder[key as keyof Shareholder]}
                      onChange={(e) =>
                        setNewShareholder({
                          ...newShareholder,
                          [key]: e.target.value,
                        })
                      }
                      required
                    />
                  )}
                </div>
              ))}
              <Button type="submit">Add Shareholder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
