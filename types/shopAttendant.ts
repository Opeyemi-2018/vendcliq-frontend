/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";
export interface AddShopAttendantPayload {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  store_ids: string[];
}

export interface AddShopAttendantResponse {
  status: string;
  msg: string;
  data?: any;
}

export const shopAttendantSchema = z.object({
  firstname: z.string().min(1, " first name is required"),
  lastname: z.string().min(1, "last name is required"),
  email: z
    .string()
    .email("must be a valid email address")
    .min(1, "email is required"),
  password: z.string().min(1, "password is required"),
  phone: z
    .string()
    .min(9, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
});

export type ShopAttendantForm = z.infer<typeof shopAttendantSchema>;

export interface Attendant {
  id: number;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountRole: "ATTENDANTS";
  accountStatus: "ACTIVE" | "INACTIVE" | string;
  accessLevel: number;
  storeIds: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface AttendantsData {
  attendants: Attendant[];
  totalCount: number;
}

export interface GetAttendantsResponse {
  status: "success" | "error";
  msg: string;
  data: AttendantsData;
}


export interface AssignAttendantPermissionsPayload {
  attendant_id: number;
  can_buy: boolean;
  can_sell: boolean;
  can_update_stock: boolean;
  can_move_stock: boolean;
  can_add_stock: boolean;
  can_market_place: boolean;
  can_push_to_market: boolean;
  can_view_store_info: boolean;
  can_reporting: boolean;
  can_expenses: boolean;
}

export interface AssignAttendantPermissionsResponse {
  message: any;
  statusCode: number;
  error: null | any;
  data: {
    attendant_id: number;
    user_id: number;
    can_buy: boolean;
    can_sell: boolean;
    can_update_stock: boolean;
    can_move_stock: boolean;
    can_add_stock: boolean;
    can_market_place: boolean;
    can_push_to_market: boolean;
    can_view_store_info: boolean;
    can_reporting: boolean;
    can_expenses: boolean;
    uuid: string;
    id: number;
    created_at: string;
    updated_at: string;
  } | null;
}

