import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import MultiValueInput from "@/components/ui/MultiValueInput";
import { useGetProfile } from "@/services/profile/Profile";

import React from "react";

export const BusinessProfile = () => {
  const { profile } = useGetProfile();
  console.log("settings", profile);
  const business = profile?.business;
  return (
    <div className="flex">
      <div className="md:mt-0 mt-10 bg-white w-full max-w-[800px] p-5 sm:p-10">
        <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3">
          Create your Business Profile
        </p>

        <div className="gap-5 grid grid-cols-1 sm:grid-cols-2 mt-10">
          <Field
            label="Business Name"
            value={business?.name}
            placeholder="Business Name"
          />
          <Field
            label="Business Email"
            placeholder="Business Email"
            value={business?.email}
          />
          <Field
            label="Business Phone Number"
            placeholder="Business Phone Number"
            value={business?.phone}
          />
          <Field
            label="Business Address"
            value={business?.address?.address}
            placeholder="Business Address"
          />
          {/* <div className="space-y-2">
            <Field
              label="Proof of Address"
              placeholder="Proof of Address"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Handle file upload
                  console.log("File selected:", file);
                }
              }}
            />
            {business?.address?.proofOfAddress && (
              <div className="border rounded p-2">
                <Image
                  src={business?.address?.proofOfAddress}
                  alt="Proof of Address"
                  width={100}
                  height={100}
                  className="max-w-[200px] h-auto"
                />
              </div>
            )}
          </div> */}
          <Field
            label="Memo"
            placeholder="Memo"
            value={business?.registration.memoOfAssociation}
          />
          <Field
            label="Date of Incorporation"
            placeholder="Date of Incorporation"
            value={business?.registration.dateOfIncorporation}
          />
          <Field
            label="RC Number"
            placeholder="RC Number"
            value={business?.registration.rcNumber}
          />
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
