import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/utils/api/apiHelper";
import { GET_PROFILE } from "@/url/api-url";

interface Address {
  address: string;
  proofOfAddress: string;
  verified: boolean;
}

interface Registration {
  certificate: string;
  dateOfIncorporation: string;
  isRegistered: boolean;
  memoOfAssociation: string;
  rcNumber: string;
}

interface EmailVerification {
  email: string;
  verified: string;
}

interface Identity {
  card: string;
  verified: null | string;
}

interface PhoneVerification {
  number: string;
  verified: string;
}

interface BusinessProfile {
  address: Address;
  alias: null | string;
  creditLimit: number;
  date: string;
  email: string;
  logo: null | string;
  name: string;
  phone: string;
  profileCompletionStep: string;
  referral: null | string;
  registration: Registration;
  status: string;
  tierLevel: null | string;
  type: string;
}

interface AccountStatus {
  accountRole: string;
  status: string;
}

interface UserProfile {
  email: EmailVerification;
  firstname: string;
  identity: Identity;
  lastname: string;
  phone: PhoneVerification;
  pin: boolean;
}

interface ProfileResponse {
  data: {
    business: BusinessProfile;
    account: AccountStatus;
    email: EmailVerification;
    firstname: string;
    identity: Identity;
    lastname: string;
    phone: PhoneVerification;
    pin: boolean;
  };
}

export const useGetProfile = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetcher<ProfileResponse>(GET_PROFILE),
    retry: false,
  });

  return {
    profile: data?.data,
    isLoading,
    isError,
    error,
  };
};
