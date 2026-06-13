import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  handleCreateCustomer,
  handleUpdateCustomer,
  handleGetCustomerById,
  handleReturnCustomerEmpties,
} from "@/lib/utils/api/apiHelper";
import { CreateCustomerPayload } from "@/types/customer";

export const customerKeys = {
  all: ["customers"] as const,
  detail: (id: string) => ["customers", id] as const,
  empties: (customerId: string) => ["customers", customerId, "empties"] as const,
};

export const useCustomers = () => {
  return useQuery({
    queryKey: customerKeys.all,
    queryFn: async () => {
      const result = await getCustomers();
      if (result.statusCode === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to load customers");
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCustomerById = (customerId: string) => {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: async () => {
      const result = await handleGetCustomerById(customerId);
      if (result.statusCode === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to load customer details");
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCustomerEmpties = (customerId: string) => {
  const { data: customer, isLoading, error } = useCustomerById(customerId);
  
  return {
    data: customer?.customer_empties ?? [],
    customer,
    isLoading,
    error,
  };
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => handleCreateCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: Omit<CreateCustomerPayload, "email"> }) =>
      handleUpdateCustomer(customerId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) });
    },
  });
};

export const useReturnCustomerEmpties = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, emptiesId, payload }: { customerId: string; emptiesId: string; payload: { quantityReturned: number; notes?: string } }) =>
      handleReturnCustomerEmpties(customerId, emptiesId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.empties(variables.customerId) });
    },
  });
};