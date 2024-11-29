import { poster } from "@/lib/utils/api/apiHelper";
import {
  BUSINESS_INFORMATION_SETUP_STEP_ONE,
  BUSINESS_INFORMATION_SETUP_STEP_TWO,
  IDENTITY_UPLOAD,
} from "@/url/api-url";

interface BusinessSetupStepOnePayload {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessProofOfAddress: File | null;
}

interface BusinessSetupStepTwoPayload {
  rcNumber: string;
  dateOfIncorporation: string;
  shareholders: Shareholder[];
  cacCertificate: File | null;
  memoOfAssociation: string;
}

interface Shareholder {
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  bank_verification_number: string;
}

interface BusinessSetupResponse {
  status: string;
  message: string;
  data: {
    profileCompletionStep: string;
  };
}

interface IdentityPayload {
  file: File | null;
}

const appendToFormData = (
  formData: FormData,
  key: string,
  value: string | File | null
) => {
  if (value !== null) {
    formData.append(key, value);
  }
};

export const handleBusinessSetup = async (
  formData: FormData
): Promise<BusinessSetupResponse> => {
  return await poster<BusinessSetupResponse, FormData>(
    BUSINESS_INFORMATION_SETUP_STEP_ONE,
    formData
  );
};

export const handleBusinessSetupStepTwo = async (
  formData: FormData
): Promise<BusinessSetupResponse> => {
  return await poster<BusinessSetupResponse, FormData>(
    BUSINESS_INFORMATION_SETUP_STEP_TWO,
    formData
  );
};

export const handleIdentityUpload = async (payload: IdentityPayload) => {
  const formData = new FormData();

  appendToFormData(formData, "file", payload.file);

  return await poster<BusinessSetupResponse, FormData>(
    IDENTITY_UPLOAD,
    formData
  );
};
