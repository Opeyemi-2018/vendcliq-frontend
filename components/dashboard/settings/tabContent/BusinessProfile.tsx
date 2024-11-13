import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import MultiValueInput from "@/components/ui/MultiValueInput";
import React from "react";

export const BusinessProfile = () => {
  return (
    <div className="flex">
      <div className="md:mt-0 mt-10 bg-white w-full max-w-[800px] p-5 sm:p-10">
        <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3">
          Create your Business Profile
        </p>

        <div className="gap-5 grid grid-cols-1 sm:grid-cols-2 mt-10">
          <Field label="Business Name" placeholder="Business Name" />
          <Field label="Business Email" placeholder="Business Email" />
          <Field
            label="Business Phone Number"
            placeholder="Business Phone Number"
          />
          <Field label="Business Address" placeholder="Business Address" />
          <Field label="Proof of Address" placeholder="Proof of Address" />
          <Field label="Memo" placeholder="Memo" />
          <Field
            label="Date of Incorporation"
            placeholder="Date of Incorporation"
          />
          <Field label="RC Number" placeholder="RC Number" />
        </div>

        <MultiValueInput label="Add shareholders" />

        <div className="flex mt-10 gap-5 justify-end">
          <Button className="bg-inherit text-primary hover:bg-light-gray border border-primary rounded-none">
            Cancel
          </Button>
          <Button className="rounded-none text-black">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
