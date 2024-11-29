import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/ui/PasswordInput";
import React, { useState } from "react";
import { useChangePassword } from "@/services/settings/Settings";
import { toast } from "react-toastify";

export const Password = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { changePassword, isLoading, isError, error } = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "msg" in error) {
        toast.error((error as { msg: string }).msg);
      } else {
        toast.error("Failed to change password. Please try again.");
      }
      console.error("Error changing password:", error);
    }
  };

  return (
    <div className="flex">
      <div className="md:mt-0 mt-10 bg-white w-full max-w-[600px] p-5 sm:p-10">
        <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3">
          Update your Profile Password
        </p>

        <form onSubmit={handleSubmit} className="gap-5 grid grid-cols-1 mt-10">
          <PasswordInput
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            required
          />
          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={setNewPassword}
            required
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
          />

          <div className="flex mt-10 gap-5 justify-end">
            <Button
              type="button"
              className="bg-inherit text-primary hover:bg-light-gray border border-primary rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-none text-black"
              disabled={isLoading}
            >
              {isLoading ? "Changing..." : "Save Changes"}
            </Button>
          </div>
        </form>
        {/* 
        {isError && (
          <p className="text-red-500 mt-4">
            {(error as Error)?.message || "An error occurred"}
          </p>
        )} */}
      </div>
    </div>
  );
};
