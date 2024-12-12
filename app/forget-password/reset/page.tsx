"use client";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import { handleApiError, handleResetPassword } from "@/lib/utils/api/apiHelper";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface FormData {
  otp: string;
  password: string;
  confirmPassword: string;
}

const Page = () => {
  const [formData, setFormData] = useState<FormData>({
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.otp || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await handleResetPassword({
        confirmPassword: formData.confirmPassword,
        otp: formData.otp,
        password: formData.password,
      });
      if (response.status === "success") {
        toast.success(response.msg);
        router.push("/login");
      }
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-inherit md:bg-white mt-40 px-10 py-6">
      <h2 className="text-xl font-semibold text-black text-left pb-2">
        Reset Your Password
      </h2>
      <p className="text-sm text-black text-left font-sans">
        Enter the OTP sent to your email and your new password
      </p>

      <div className="font-sans mt-5 space-y-4">
        <Input
          label="OTP"
          name="otp"
          placeholder="Enter OTP"
          className="w-full"
          value={formData.otp}
          onChange={handleChange}
        />

        <Input
          label="New Password"
          name="password"
          type="password"
          placeholder="Enter new password"
          className="w-full"
          value={formData.password}
          onChange={handleChange}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          className="w-full"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <p
          className="text-sm text-primary font-bold mt-2 text-right cursor-pointer"
          onClick={() => router.push("/login")}
        >
          Back to Login
        </p>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full text-black"
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </Button>
      </div>
    </div>
  );
};

export default Page;
