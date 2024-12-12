"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetcher,
  handleVerifyBankAccount,
  poster,
} from "@/lib/utils/api/apiHelper";
import {
  GET_BANK_ACCOUNT,
  INVENTORY_LIST,
  VERIFY_BANK_ACCOUNT,
} from "@/url/api-url";

interface InventoryItem {
  id: number;
  containerType: string;
  flavour: string;
  image: string;
  itemsPerPack: number | null;
  manufacturer?: string;
  name: string;
  productType?: string;
  sizeCl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InventoryResponse {
  total: number;
  results: InventoryItem[];
}

interface VerifyResponse {
  status: string;
  data: {
    accountName: string;
  };
  msg?: string;
}

interface BankAccountResponse {
  status: string;
  msg: string;
  data: {
    accounts: {
      accountName: string;
      accountNumber: string;
      bankCode: string;
      bankName: string;
    }[];
    totalBalance: number | null;
  };
}

export const useGetInventory = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => fetcher<InventoryResponse>(INVENTORY_LIST),
    retry: false,
  });

  return {
    results: data?.results,
    total: data?.total,
    isLoading,
    isError,
    error,
  };
};

export const useVerifyBankAccount = () => {
  const verifyBankAccount = async (data: {
    accountNumber: string;
    bankCode: string;
  }): Promise<VerifyResponse> => {
    return await poster<
      VerifyResponse,
      { accountNumber: string; bankCode: string }
    >(VERIFY_BANK_ACCOUNT, data);
  };
  return { verifyBankAccount };
};

export const useGetBankAccount = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bankAccount"],
    queryFn: () => fetcher<BankAccountResponse>(GET_BANK_ACCOUNT),
    retry: false,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    error,
  };
};
