import {
  handleResendEmailVerificationToken,
  handleResendPhoneVerificationToken,
} from "@/lib/utils/api/apiHelper";

export const ResendEmailVerificationToken = async () => {
  const response = await handleResendEmailVerificationToken();
  return response;
};

export const ResendPhoneVerificationToken = async () => {
  const response = await handleResendPhoneVerificationToken();
  return response;
};
