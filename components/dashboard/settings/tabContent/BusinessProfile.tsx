import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import MultiValueInput from "@/components/ui/MultiValueInput";
import { useGetProfile } from "@/services/profile/Profile";
import React, { useState, useEffect } from "react";

export const BusinessProfile = () => {
  const { profile } = useGetProfile();
  const [businessData, setBusinessData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    memo: "",
    dateOfIncorporation: "",
    rcNumber: "",
  });

  useEffect(() => {
    console.log(profile);
    if (profile?.business) {
      setBusinessData({
        name: profile.business.name || "",
        email: profile.business.email || "",
        phone: profile.business.phone || "",
        address: profile.business.address?.address || "",
        memo: profile.business.registration.memoOfAssociation || "",
        dateOfIncorporation:
          profile.business.registration.dateOfIncorporation || "",
        rcNumber: profile.business.registration.rcNumber || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Implement save logic here

    console.log("Saving business data:", businessData);
  };

  return (
    <div className="flex">
      <div className="md:mt-0 mt-10 bg-white w-full max-w-[800px] p-5 sm:p-10">
        <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3">
          Create your Business Profile
        </p>

        <div className="gap-5 grid grid-cols-1 sm:grid-cols-2 mt-10">
          <Field
            label="Business Name"
            name="name"
            value={businessData.name}
            placeholder="Business Name"
            onChange={handleInputChange}
          />
          <Field
            label="Business Email"
            name="email"
            value={businessData.email}
            placeholder="Business Email"
            onChange={handleInputChange}
          />
          <Field
            label="Business Phone Number"
            name="phone"
            value={businessData.phone}
            placeholder="Business Phone Number"
            onChange={handleInputChange}
          />
          <Field
            label="Business Address"
            name="address"
            value={businessData.address}
            placeholder="Business Address"
            onChange={handleInputChange}
          />
          <Field
            label="Memo"
            name="memo"
            type="file"
            value={businessData.memo}
            placeholder="Memo"
            onChange={handleInputChange}
          />
          <Field
            label="Date of Incorporation"
            name="dateOfIncorporation"
            type="date"
            value={businessData.dateOfIncorporation}
            placeholder="Date of Incorporation"
            onChange={handleInputChange}
          />
          <Field
            label="RC Number"
            name="rcNumber"
            value={businessData.rcNumber}
            placeholder="RC Number"
            onChange={handleInputChange}
          />
        </div>

        <MultiValueInput label="Add shareholders" />

        <div className="flex mt-10 gap-5 justify-end">
          <Button className="bg-inherit text-primary hover:bg-light-gray border border-primary rounded-none">
            Cancel
          </Button>
          <Button className="rounded-none text-black" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
