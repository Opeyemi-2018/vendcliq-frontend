import { VERIFY_BANK_ACCOUNT } from "@/url/api-url";
import { VerifyBankAccountPayload, VerifyBankAccountResponse } from "@/types";
import { poster } from "@/lib/utils/api/apiHelper";

export const handleVerifyBankAccount = async (
  payload: VerifyBankAccountPayload
): Promise<VerifyBankAccountResponse> => {
  return await poster<VerifyBankAccountResponse, VerifyBankAccountPayload>(
    VERIFY_BANK_ACCOUNT,
    payload
  );
};
