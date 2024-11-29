import { useMutation } from "@tanstack/react-query";
import {
  handleChangePassword,
  handleCreatePin,
  handleUpdatePin,
  handleRequestPinToken,
  handleApiError,
} from "@/lib/utils/api/apiHelper";
import { ChangePasswordPayload, PinPayload, UpdatePinPayload } from "@/types";

export const useChangePassword = () => {
  const changePassword = async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    // ... perform async operations, e.g., API call
  };

  return { changePassword, isLoading: false, isError: false, error: null };
};

export const useCreatePin = () => {
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (payload: PinPayload) => handleCreatePin(payload),
    onError: (error: unknown, variables, context) => {
      console.error("Error creating PIN:", error);
    },
  });

  return {
    createPin: mutate,
    isLoading: isPending,
    isError,
    error,
  };
};

export const useUpdatePin = () => {
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (payload: UpdatePinPayload) => handleUpdatePin(payload),
    onError: (error: unknown, variables, context) => {
      console.error("Error updating PIN:", error);
    },
  });

  return {
    updatePin: mutate,
    isLoading: isPending,
    isError,
    error,
  };
};

export const useRequestPinToken = () => {
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => handleRequestPinToken(),
    onError: (error: unknown, variables, context) => {
      console.error("Error requesting PIN token:", error);
    },
  });

  return {
    requestPinToken: mutate,
    isLoading: isPending,
    isError,
    error,
  };
};
