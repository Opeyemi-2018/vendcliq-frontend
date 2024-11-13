import { Button } from "@/components/ui/button";
import CustomFileInput from "@/components/ui/CustomFileInput";
import Field from "@/components/ui/Field";
import React from "react";

export const PersonalProfile = () => {
  return (
    <div className="flex">
      <div className="md:mt-0 mt-10 bg-white w-full max-w-[800px] p-5 sm:p-10">
        <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3">
          Update your Personal Profile
        </p>

        <div className="gap-5 grid grid-cols-1 sm:grid-cols-2 mt-10">
          <Field label="First Name" placeholder="First Name" />
          <Field label="Last Name" placeholder="Last Name" />
        </div>

        <Field
          label="Email Address"
          className="mt-5"
          placeholder="Email Address"
          type="email"
        />

        <div className="mt-7">
          <CustomFileInput label="ID Card" />
        </div>

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
