/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { handleChangePassword } from "@/lib/utils/api/apiHelper"; // adjust path
import { ClipLoader } from "react-spinners";

const ChangePassword = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { oldPassword: "", newPassword: "", confirmPassword: "" };

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Old password is required";
      valid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      valid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      currentPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const response = await handleChangePassword(payload);

      if (response.status === "success") {
        toast.success(response.msg || "Password updated successfully!");
        // Reset form
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        toast.error(response.msg || "Failed to update password");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.msg || "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <div className="mb-4">
        <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
          Change Password
        </h1>
        <Separator
          orientation="horizontal"
          className="h-[1px] mt-3"
          style={{ background: "#E0E0E0" }}
        />
        <p className="text-[16px] font-dm-sans text-[#9E9A9A]">
          Create a strong password (Min 8 characters, include letters numbers
          and symbols)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Old Password */}
        <div className="space-y-2">
          <Label htmlFor="oldPassword">Old Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="oldPassword"
              type={showOldPassword ? "text" : "password"}
              placeholder="Enter old password"
              value={formData.oldPassword}
              onChange={(e) =>
                setFormData({ ...formData, oldPassword: e.target.value })
              }
              className="pl-10 pr-10 py-5 md:py-6"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showOldPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="text-red-600 text-sm">{errors.oldPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="pl-10 pr-10 py-5 md:py-6"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-600 text-sm">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="pl-10 pr-10 py-5 md:py-6"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full  bg-[#0A6DC0] hover:bg-[#085a9e] text-white py-5 md:py-6  transition"
        >
          {isSubmitting ? (
            <>
              Updating... <ClipLoader size={24} color="white" />
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
