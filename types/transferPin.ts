/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PinPayload {
  otp?: string;
  pin: string;
  confirmPin: string;
}
export interface RequestPinTokenResponse {
  status: "success" | "error" | string;
  msg: string;
  data: null | any;  
}

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