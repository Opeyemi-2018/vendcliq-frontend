"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/Fileupload";
import MultiValueInput from "@/components/ui/MultiValueInput";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Logo from "@/components/Logo";
import Step from "@/components/ui/Step";

import axios from "axios";

import { useGetProfile } from "@/services/profile/Profile";
import { useDashboardData } from "@/services/home/home";
import { ClipLoader } from "react-spinners";

interface Shareholder {
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  bank_verification_number: string;
}

interface IdentityPayload {
  file: File | null;
}

interface StepOnePayload {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessProofOfAddress: File | null;
  bvn: string;
}

interface StepTwoPayload {
  rcNumber: string;
  dateOfIncorporation: string;
  shareholders: Shareholder[];
  businessCACCertificate: File | null;
  businessMemoOfAssociation: File | null;
}

interface FormValues {
  file: File | null;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  bvn: string;
  rcNumber: string;
  dateOfIncorporation: string;
  shareholders: Shareholder[];
  businessProofOfAddress: File | null;
  businessCACCertificate: File | null;
  businessMemoOfAssociation: File | null;
  [key: string]: string | File | null | Shareholder[] | undefined;
}

const validationSchemas = [
  // Step 0 validation
  Yup.object({
    file: Yup.mixed().required("Identity document is required"),
  }),

  // Step 1 validation
  Yup.object({
    businessName: Yup.string()
      .min(3, "Business name must have at least 3 characters")
      .required("Business name is required"),
    businessEmail: Yup.string()
      .email("Invalid email")
      .required("Business email is required"),
    businessPhone: Yup.string()
      .matches(/^(0|234|\+234)\d{10}$/, "Invalid phone number")
      .required("Business phone is required"),
    businessAddress: Yup.string().required("Business address is required"),
    bvn: Yup.string()
      .min(11, "BVN must be 11 digits")
      .max(11, "BVN must be 11 digits")
      .required("BVN is required"),
    businessProofOfAddress: Yup.mixed().required(
      "Proof of address is required"
    ),
  }),

  // Step 2 validation
  Yup.object({
    rcNumber: Yup.string().required("RC number is required"),
    dateOfIncorporation: Yup.string().required(
      "Date of incorporation is required"
    ),
    shareholders: Yup.array()
      .of(
        Yup.object({
          firstname: Yup.string().required("First name is required"),
          lastname: Yup.string().required("Last name is required"),
          gender: Yup.string().required("Gender is required"),
          date_of_birth: Yup.string().required("Date of birth is required"),
          phone: Yup.string().required("Phone is required"),
          bank_verification_number: Yup.string().required("BVN is required"),
        })
      )
      .min(1, "At least one shareholder is required"),
    businessCACCertificate: Yup.mixed().required("CAC certificate is required"),
    businessMemoOfAssociation: Yup.mixed().required(
      "Memo of association is required"
    ),
  }),
];

const steps = ["Upload Identity", "Business Information", "Upload CAC"];

const AccountSetup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { isLoading: isDashboardLoading } = useDashboardData();
  const { profile, isLoading: isProfileLoading } = useGetProfile();
  //  console.log ("profile>>>>", profile);
  const [identityPayload, setIdentityPayload] = useState<IdentityPayload>({
    file: null,
  });

  const [stepOnePayload, setStepOnePayload] = useState<StepOnePayload>({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    businessProofOfAddress: null as File | null,
    bvn: "",
  });

  const [stepTwoPayload, setStepTwoPayload] = useState<StepTwoPayload>({
    rcNumber: "",
    dateOfIncorporation: "",
    shareholders: [
      {
        firstname: "",
        lastname: "",
        gender: "",
        date_of_birth: "",
        phone: "",
        bank_verification_number: "",
      },
    ],
    businessCACCertificate: null,
    businessMemoOfAssociation: null,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isProfileLoading && profile) {
      setCurrentStep(Number(profile?.business?.profileCompletionStep || 0));

      setStepOnePayload({
        businessName: "",
        businessEmail: profile.business?.email || profile.email?.email || "",
        businessPhone: "",
        businessAddress: "",
        businessProofOfAddress: null,
        bvn: "",
      });

      setStepTwoPayload({
        rcNumber: profile.business?.registration?.rcNumber || "",
        dateOfIncorporation:
          profile.business?.registration?.dateOfIncorporation || "",
        shareholders: [
          {
            firstname: profile.firstname || "",
            lastname: profile.lastname || "",
            gender: "",
            date_of_birth: "",
            phone: profile.phone?.number || "",
            bank_verification_number: "",
          },
        ],
        businessCACCertificate: null,
        businessMemoOfAssociation: null,
      });
    }
  }, [profile, isProfileLoading]);

  // console.log("identityPayload>>>", identityPayload);
  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    const formData = new FormData();

    try {
      if (currentStep === 0) {
        if (!identityPayload.file) {
          setError("Please upload an identity document");
          return;
        }
        formData.append("file", identityPayload.file);

        const token = localStorage.getItem("authToken");
        const response = await axios.post(
          "https://api.vendcliq.com/client/v1/auth/upload-identity",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // console.log(response);
        if (response.status === 200) {
          setError(null);
          handleNext();
        }
      } else if (currentStep === 1) {
        if (
          !values.businessName ||
          !values.businessEmail ||
          !values.businessPhone ||
          !values.businessAddress ||
          !values.bvn ||
          !values.businessProofOfAddress
        ) {
          setError(
            "Please fill in all required fields including proof of address"
          );
          return;
        }

        const formData = new FormData();
        formData.append("businessName", values.businessName);
        formData.append("businessEmail", values.businessEmail);
        formData.append("businessPhone", values.businessPhone);
        formData.append("businessAddress", values.businessAddress);
        formData.append("bvn", values.bvn);

        if (values.businessProofOfAddress instanceof File) {
          formData.append(
            "businessProofOfAddress",
            values.businessProofOfAddress
          );
        }

        const token = localStorage.getItem("authToken");
        const response = await axios.post(
          "https://api.vendcliq.com/client/v1/auth/business-information",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // console.log(response);
        if (response.status === 200) {
          setError(null);
          handleNext();
        }
      } else if (currentStep === 2) {
        if (
          !values.rcNumber ||
          !values.dateOfIncorporation ||
          !values.shareholders ||
          !values.businessCACCertificate ||
          !values.businessMemoOfAssociation
        ) {
          setError(
            "Please fill in all required fields and upload all documents"
          );
          return;
        }

        formData.append("rcNumber", values.rcNumber);
        formData.append("dateOfIncorporation", values.dateOfIncorporation);
        formData.append("shareholders", JSON.stringify(values.shareholders));

        if (values.businessCACCertificate instanceof File) {
          formData.append(
            "businessCACCertificate",
            values.businessCACCertificate
          );
        }
        if (values.businessMemoOfAssociation instanceof File) {
          formData.append(
            "businessMemoOfAssociation",
            values.businessMemoOfAssociation
          );
        }

        const token = localStorage.getItem("authToken");
        const response = await axios.post(
          "https://api.vendcliq.com/client/v1/auth/business-information-step2",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 200) {
          router.push("/dashboard/home");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Failed to upload identity document"
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePayload = (
    key: keyof IdentityPayload | keyof StepOnePayload | keyof StepTwoPayload,
    value: string | File | null | Shareholder[]
  ) => {
    setError(null);
    if (currentStep === 0) {
      setIdentityPayload({ ...identityPayload, [key]: value });
    } else if (currentStep === 1) {
      setStepOnePayload({ ...stepOnePayload, [key]: value });
    } else {
      // console.log("stepTwoPayload", stepTwoPayload);
      setStepTwoPayload({ ...stepTwoPayload, [key]: value });
    }
  };

  const getInitialValues = () => {
    switch (currentStep) {
      case 0:
        return identityPayload;
      case 1:
        return stepOnePayload;
      case 2:
        return stepTwoPayload;
      default:
        return {};
    }
  };

  if (isProfileLoading || isDashboardLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#000" size={50} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between px-4 md:px-20 pt-10 w-full">
        <div>
          <Logo />
        </div>

        <X
          size={24}
          className="cursor-pointer hover:bg-white rounded-full"
          onClick={() => router.push("/dashboard/home")}
        />
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#F1F0EE] gap-5 py-5 px-4 lg:py-10 lg:px-20">
        {/* Left Form Area */}

        <div className="w-full lg:w-2/3 p-5 lg:p-10 bg-white rounded-lg">
          <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
            Complete Account Setup
          </h3>

          <p className="text-gray-600 mb-6 lg:mb-8 font-sans">
            {currentStep === 0
              ? "Please upload your identity document"
              : "Kindly enter your business details"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <Formik<FormValues>
            initialValues={getInitialValues() as FormValues}
            validationSchema={validationSchemas[currentStep]}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange }) => (
              <Form>
                {/* Step Form */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 gap-4 lg:gap-6 font-sans">
                    <div className="col-span-1">
                      <FileUpload
                        id="identity-document"
                        label="Upload Identity Document"
                        accept=".png,.jpg,.jpeg,.pdf"
                        maxSize={5 * 1024 * 1024} // 5MB
                        onChange={(file) => updatePayload("file", file)}
                        name="file"
                      />
                      {touched?.file && errors?.file && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.file as string}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 font-sans">
                    {[
                      {
                        label: "Business Name",
                        type: "text",
                        placeholder: "Enter name",
                        name: "businessName",
                      },
                      {
                        label: "Business Email",
                        type: "email",
                        placeholder: "Enter email",
                        name: "businessEmail",
                      },
                      {
                        label: "Business Phone Number",
                        type: "text",
                        placeholder: "Enter phone number",
                        name: "businessPhone",
                      },
                      {
                        label: "Business Address",
                        type: "text",
                        placeholder: "Enter address",
                        name: "businessAddress",
                      },
                      {
                        label: "BVN",
                        type: "text",
                        placeholder: "Enter BVN",
                        name: "bvn",
                      },
                    ].map(({ label, type, placeholder, name }, index) => (
                      <div key={index}>
                        <Field
                          label={label}
                          type={type}
                          placeholder={placeholder}
                          name={name}
                          onChange={handleChange}
                          value={values[name]?.toString() ?? ""}
                          error={
                            touched[name] && errors[name]
                              ? String(errors[name])
                              : undefined
                          }
                        />
                      </div>
                    ))}
                    <div className="col-span-1 lg:col-span-2">
                      <FileUpload
                        id="business-proof-of-address"
                        label="Attach Proof Of Address"
                        accept=".png,.jpg,.jpeg,.pdf"
                        maxSize={5 * 1024 * 1024}
                        onChange={(file) => {
                          handleChange({
                            target: {
                              name: "businessProofOfAddress",
                              value: file,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 font-sans">
                    <div>
                      <Field
                        label="RC Number"
                        type="text"
                        placeholder="Enter number"
                        name="rcNumber"
                        onChange={handleChange}
                        value={values.rcNumber}
                        error={touched.rcNumber && errors.rcNumber}
                      />
                    </div>
                    <div>
                      <Field
                        label="Date of Incorporation"
                        type="date"
                        name="dateOfIncorporation"
                        onChange={handleChange}
                        value={values.dateOfIncorporation}
                        error={
                          touched.dateOfIncorporation &&
                          errors.dateOfIncorporation
                        }
                      />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                      <MultiValueInput
                        label="Add shareholders"
                        onChange={(shareholders: Shareholder[]) => {
                          handleChange({
                            target: {
                              name: "shareholders",
                              value: shareholders,
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                      <FileUpload
                        id="business-cac-certificate"
                        label="CAC Certificate"
                        accept=".png,.jpg,.jpeg,.pdf"
                        maxSize={5 * 1024 * 1024}
                        onChange={(file) => {
                          handleChange({
                            target: {
                              name: "businessCACCertificate",
                              value: file,
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                      <FileUpload
                        id="business-memo"
                        label="Business Memo of Association"
                        accept=".png,.jpg,.jpeg,.pdf"
                        maxSize={5 * 1024 * 1024}
                        onChange={(file) => {
                          handleChange({
                            target: {
                              name: "businessMemoOfAssociation",
                              value: file,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col lg:flex-row justify-between mt-6 lg:mt-8 gap-3 lg:gap-5">
                  {currentStep > 0 && (
                    <Button
                      className="px-6 py-2 font-sans bg-gray-200 text-gray-700 rounded-none"
                      onClick={handleBack}
                      disabled={loading}
                      type="button"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className="px-6 py-2 w-full lg:w-auto font-sans bg-yellow-500 text-black rounded-none"
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : currentStep === steps.length - 1
                      ? "Finish"
                      : "Next"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Right Steps Sidebar */}
        <div className="w-full lg:w-1/3 p-5 lg:p-10 mt-5 lg:mt-0 rounded-lg bg-white">
          <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
            Registration Steps
          </h3>
          <ol className="space-y-3 lg:space-y-4 font-sans">
            {steps.map((step, index) => (
              <Step
                key={index}
                step={index + 1}
                currentStep={currentStep + 1}
                label={step}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AccountSetup;
