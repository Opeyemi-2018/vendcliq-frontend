// types/index.ts (add these)

export interface UpdatePinPayload {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

export interface UpdatePinResponse {
  status: "success" | "error";
  msg: string;
  data: null;
}