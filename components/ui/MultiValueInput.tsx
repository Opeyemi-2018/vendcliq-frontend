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
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

interface Shareholder {
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  bank_verification_number: string;
}

const ShareholderSchema = Yup.object().shape({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  gender: Yup.string().required("Gender is required"),
  date_of_birth: Yup.string().required("Date of birth is required"),
  phone: Yup.string().required("Phone number is required"),
  bank_verification_number: Yup.string()
    .required("BVN is required")
    .min(11, "BVN must be 11 digits")
    .max(11, "BVN must be 11 digits"),
});

// Add this interface for the Field render prop
interface FieldProps {
  field: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  };
}

export default function MultiValueInput({
  label,
  onChange,
}: {
  label: string;
  onChange?: (shareholders: Shareholder[]) => void;
}) {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [open, setOpen] = useState(false);

  const initialValues: Shareholder = {
    firstname: "",
    lastname: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    bank_verification_number: "",
  };

  const addShareholder = (values: Shareholder) => {
    const updatedShareholders = [...shareholders, values];
    setShareholders(updatedShareholders);
    onChange?.(updatedShareholders);
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
            <Formik
              initialValues={initialValues}
              validationSchema={ShareholderSchema}
              onSubmit={(values) => {
                addShareholder(values);
              }}
            >
              {({ errors, touched, setFieldValue }) => (
                <Form className="space-y-4">
                  {Object.keys(initialValues).map((key) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      {key === "gender" ? (
                        <Select
                          onValueChange={(value) => setFieldValue(key, value)}
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
                        <Field name={key}>
                          {({ field }: FieldProps) => (
                            <Input type="date" {...field} id={key} required />
                          )}
                        </Field>
                      ) : (
                        <Field name={key}>
                          {({ field }: FieldProps) => (
                            <Input {...field} id={key} required />
                          )}
                        </Field>
                      )}
                      {errors[key as keyof Shareholder] &&
                        touched[key as keyof Shareholder] && (
                          <div className="text-red-500 text-sm">
                            {errors[key as keyof Shareholder]}
                          </div>
                        )}
                    </div>
                  ))}
                  <Button type="submit">Add Shareholder</Button>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
