import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/ui/PasswordInput";
import React, { useState } from "react";

export const Password = () => {
  const [oldpassword, setOldPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  return (
    <div>
      <div className="mt-10 bg-white w-[600px] p-10">
        <p className="font-medium text-lg  font-clash border-l-4 border-primary pl-3 ">
          Update your Profile Password
        </p>
        <div className="  gap-5 grid grid-cols-1  mt-10">
          <PasswordInput
            label="Old Password"
            placeholder="Enter old password"
            value={oldpassword}
            onChange={setOldPassword}
          />
          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            value={newpassword}
            onChange={setNewPassword}
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmpassword}
            onChange={setConfirmPassword}
          />
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
