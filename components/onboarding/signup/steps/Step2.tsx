"use client";
import BoxOption from "@/components/ui/BoxOption";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import PasswordInput from "@/components/ui/PasswordInput";
import { poster } from "@/lib/utils/api/apiHelper";
import { SIGN_UP } from "@/url/api-url";
import { Label } from "@radix-ui/react-dropdown-menu";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { AxiosError } from "axios";
import { Formik, Form } from "formik";
import Link from "next/link";
import React from "react";
import { IoArrowBack } from "react-icons/io5";
import { toast } from "react-toastify";
import * as Yup from "yup";

type SignupPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  status: string;
  business: {
    isRegistered: boolean;
    type: string;
  };
  referral: string;
  token: string;
  data: {
    token: {
      token: string;
    };
  };
};

type SignupStepTwoProps = {
  nextStep: () => void;
  title: string;
  previousData: { businessType: string };
  prevStep: () => void;
};

const validationSchema = Yup.object({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  referral: Yup.string(),
  submit: Yup.string(),
});

const SignupStepTwo: React.FC<SignupStepTwoProps> = ({
  nextStep,
  title,
  previousData,
  prevStep,
}) => {
  const initialValues = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    isRegistered: true,
    referral: "",
    submit: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    {
      setSubmitting,
      setFieldError,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setFieldError: (field: string, message: string) => void;
    }
  ) => {
    try {
      const payload = {
        ...values,
        business: {
          isRegistered: values.isRegistered,
          type: previousData.businessType,
        },
      };

      const response = await poster<SignupPayload, typeof payload>(
        SIGN_UP,
        payload
      );

      if (response.status === "success") {
        toast.success("Account created successfully");
        const token = response.data.token.token;
        localStorage.setItem("authToken", token);
        localStorage.setItem("email", payload.email);
        nextStep();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorData = error.response?.data;
        if (errorData?.data?.[0]?.message) {
          setFieldError("submit", errorData.data[0].message);
        } else {
          setFieldError("submit", errorData?.msg || "An error occurred");
        }
      } else {
        setFieldError("submit", "An unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      <button
        onClick={() => prevStep()}
        className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-800"
      >
        <IoArrowBack size={20} />
        <span>Back</span>
      </button>
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          setFieldValue,
          isSubmitting,
        }) => (
          <Form className="mt-5 font-sans">
            <div className="flex gap-5">
              <Input
                label="First Name"
                name="firstname"
                onChange={handleChange}
                value={values.firstname}
                className="flex-1 mb-0"
                error={touched.firstname ? errors.firstname : undefined}
              />
              <Input
                label="Last Name"
                name="lastname"
                onChange={handleChange}
                value={values.lastname}
                className="flex-1 mb-0"
                error={touched.lastname ? errors.lastname : undefined}
              />
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              onChange={handleChange}
              value={values.email}
              className="flex-1 my-5"
              error={touched.email ? errors.email : undefined}
            />

            <div>
              <Label className="text-sm text-[#2F2F2F] pb-2">
                Is your business incorporated with the Corporate Affairs
                Commission?
              </Label>
              <RadioGroup
                className="flex gap-7"
                value={values.isRegistered ? "yes" : "no"}
                onValueChange={(value) =>
                  setFieldValue("isRegistered", value === "yes")
                }
              >
                <BoxOption
                  value="yes"
                  title="Yes"
                  selectedValue={values.isRegistered ? "yes" : "no"}
                />
                <BoxOption
                  value="no"
                  title="No"
                  selectedValue={values.isRegistered ? "yes" : "no"}
                />
              </RadioGroup>
            </div>

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              className="mt-4"
              onChange={(value) => setFieldValue("password", value)}
              value={values.password}
              error={touched.password ? errors.password : undefined}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              className="mt-4"
              onChange={(value) => setFieldValue("confirmPassword", value)}
              value={values.confirmPassword}
              error={
                touched.confirmPassword ? errors.confirmPassword : undefined
              }
            />

            <Input
              label="Referral Code"
              name="referral"
              onChange={handleChange}
              value={values.referral}
              className="flex-1 my-5"
              error={touched.referral ? errors.referral : undefined}
            />

            {errors.submit && <p className="text-red-500">{errors.submit}</p>}

            <Button
              type="submit"
              className="mt-6 w-full text-white rounded-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Continue"}
            </Button>
          </Form>
        )}
      </Formik>

      <div className="flex gap-1 items-center justify-center mt-3 font-sans text-sm">
        <p className="text-black">I already have an account?</p>
        <Link href={"/"}>
          <p className="text-primary">Login</p>
        </Link>
      </div>
    </div>
  );
};

export default SignupStepTwo;
