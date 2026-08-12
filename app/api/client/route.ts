/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * API Route Handler for /api/client
 * Secure proxy between frontend and backend APIs (VERA + INVENTORY)
 */

import { NextResponse } from "next/server";
import {
  VERIFY_EMAIL,
  CONFIRM_PHONE_NUMBER,
  SIGN_IN,
  SIGN_UP,
  VERIFY_PHONE_NUMBER,
  VALIDATE_BVN,
  REQUEST_BVN_TOKEN,
  VERIFY_BVN_TOKEN,
  UPLOAD_BUSINESS_VERIFICATION,
  SEND_OTP_FOR_FORGET_PASSWORD,
  RESET_PASSWORD,
  CREATE_PASSWORD,
  CREATE_BUSINESS_DETAILS,
  RESEND_VERIFICATION_TOKEN,
  CREATE_STORE,
  CREATE_STOCK,
  GET_ALL_PRODUCTS,
  GET_PRODUCTS_PAGINATED,
  TRANSACTION_HISTORY,
  WALLET_TRANSFER,
  LOOKUP_ACCOUNT,
  UPDATE_BENEFICIARY,
  GET_NETWORK_PROVIDER,
  GET_DATA_PLANS,
  BUY_AIRTIME,
  BUY_DATA,
  PIN_VALIDATE,
  CREATE_WALLET,
  GET_NIP_BANKS,
  NAME_ENQUIRY,
  ADD_SHOP_ATTENDANT,
  CREATE_INVOICE,
  EDIT_INVOICE,
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  CREATE_CART,
  CHECKOUT_CART,
  PAY_CART,
  GET_CART,
  UPDATE_CART_ITEM,
  DELETE_CART_ITEM,
  UPDATE_TRANSFER_PIN,
  CHANGE_PASSWORD,
  ASSIGN_ATTENDANT_PERMISSIONS,
  UPDATE_ATTENDANT_PERMISSIONS,
  CREATE_EXPENSE,
  GET_EXPENSES,
  DELETE_EXPENSE,
  GET_CUSTOMER_BY_ID,
  RETURN_CUSTOMER_EMPTIES,
  PAY_SUB,
  GET_WALLET,
  GET_SUPPLIERS,
  GET_PURCHASED_INVOICES,
  CREATE_PURCHASE,
  USER_STOCKS,
  // GET_ITEM_TRACKING_STATUS,
  UPDATE_STORE_SETTINGS,
  UPDATE_STORE,
  REQUEST_PIN_TOKEN,
  CREATE_PIN,
  GET_SUBSCRIPTION_ME,
  CREATE_BENEFICIARY,
  GET_BENEFICIARIES,
  GET_ATTENDANT_PERMISSIONS,
  GET_ATTENDANTS,
  GET_BUSINESS_REPORT_COMPARISON,
  STOCK_HISTORY,
  GET_SALES,
  GET_PURCHASE_REQUEST,
  GET_PURCHASE_REQUEST_BY_ID,
  GET_SALE_BY_ID,
  HAND_OVER_ITEM,
  SUCCESSFUL_HANDOVER,
  SUPPLIER_SALES,
  GET_STORE_ITEMS_SALES,
  CREATE_OFFER,
  UPDATE_STOCK_PRICES,
  DELETE_STOCKS_BULK,
  STOCK_CONDITIONS,
  GET_SUPPLIER_STORES,
  GET_STORE_STOCKS,
  PAY_CART_CREDIT_OTP,
  GET_CREDIT_LEDGER,
  RECORD_CREDIT_PAYMENT,
  GET_CREDIT_LEDGER_SUMMARY,
  GET_INVOICE_BY_ID,
  GET_MANUFACTURERS,
  GET_USER_STOCKS,
  RETURN_ITEMS,
  GET_CUSTOMERS,
  GET_STORE_STOCK_BY_ID,
  GET_MARKETPLACE_STOCKS,
  GET_MARKETPLACE_OFFERS,
  GET_OFFER_DETAIL,
  GET_MARKETPLACE_STOCK_DETAIL,
  GET_PRICING_PLANS,
  GET_STORES,
  GET_STORE_BY_ID,
  MOVE_STOCK,
  UPDATE_STOCK,
  GET_STOCK_DETAIL,
  GET_SUPPLIER_STOCKS,
  TRANSACTION_BY_ID,
} from "@/url/api-url";

export const dynamic = "force-dynamic";
// export const runtime = "edge";

// API Base URLs
const VERA_API_BASE_URL = process.env.VERA_API_BASE_URL as string;
const INVENTORY_API_BASE_URL = (
  process.env.VERA_INVENTORY_API_BASE_URL as string
).replace(/\/$/, "");
const LOGISTIC_API_BASE_URL = process.env
  .VENDCLIQ_LOGISTIC_API_BASE_URL as string;

if (!VERA_API_BASE_URL) throw new Error("VERA_API_BASE_URL not set");
if (!INVENTORY_API_BASE_URL)
  throw new Error("VERA_INVENTORY_API_BASE_URL not set");
if (!LOGISTIC_API_BASE_URL)
  throw new Error("VENDCLIQ_LOGISTIC_API_BASE_URL not set");

const API_KEY = process.env.PRODUCT_API_KEY as string;
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_VERSION = process.env.CLIENT_VERSION as string;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN as string;
const APP_SECRET_KEY = process.env.APP_SECRET_KEY as string;

if (!API_KEY) throw new Error("PRODUCT_API_KEY not set");
if (!CLIENT_ID) throw new Error("CLIENT_ID not set");
if (!CLIENT_VERSION) throw new Error("CLIENT_VERSION not set");
if (!CLIENT_ORIGIN) throw new Error("CLIENT_ORIGIN not set");
if (!APP_SECRET_KEY) throw new Error("APP_SECRET_KEY not set");

const AUTH_SIGNIN_PATH = SIGN_IN;
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || "100", 10);
const RATE_LIMIT_WINDOW = parseInt(
  process.env.RATE_LIMIT_WINDOW || "60000",
  10,
);

// Security Signature
const generateSignature = async (
  clientId: string,
  timestamp: string,
  method: string,
  path: string,
): Promise<string> => {
  const data = `${clientId}:${timestamp}:${method}:${path}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(APP_SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Security Headers
const addSecurityHeaders = async (
  headers: Record<string, string>,
  method: string,
  path: string,
): Promise<Record<string, string>> => {
  const timestamp = Date.now().toString();
  const clientId = CLIENT_ID;
  const signature = await generateSignature(clientId, timestamp, method, path);

  return {
    ...headers,
    "x-client-timestamp": timestamp,
    "x-client-id": clientId,
    "x-client-version": CLIENT_VERSION,
    "x-client-device": "web",
    "x-request-signature": signature,
    origin: CLIENT_ORIGIN,
  };
};

// Whitelists
const VERA_ENDPOINTS = [
  SIGN_IN,
  SIGN_UP,
  CREATE_PASSWORD,
  CREATE_BUSINESS_DETAILS,
  VERIFY_EMAIL,
  RESEND_VERIFICATION_TOKEN,
  SEND_OTP_FOR_FORGET_PASSWORD,
  RESET_PASSWORD,
  CHANGE_PASSWORD,
  VERIFY_PHONE_NUMBER,
  CONFIRM_PHONE_NUMBER,
  TRANSACTION_HISTORY,
  VALIDATE_BVN,
  REQUEST_BVN_TOKEN,
  VERIFY_BVN_TOKEN,
  UPLOAD_BUSINESS_VERIFICATION,
  PIN_VALIDATE,
  GET_WALLET,
  WALLET_TRANSFER,
  LOOKUP_ACCOUNT,
  UPDATE_BENEFICIARY,
  GET_NETWORK_PROVIDER,
  GET_DATA_PLANS,
  GET_NIP_BANKS,
  NAME_ENQUIRY,
  BUY_AIRTIME,
  BUY_DATA,
  CREATE_WALLET,
  ADD_SHOP_ATTENDANT,
  REQUEST_PIN_TOKEN,
  CREATE_PIN,
  UPDATE_TRANSFER_PIN,
  CREATE_BENEFICIARY,
  GET_BENEFICIARIES,
  GET_ATTENDANTS,
  TRANSACTION_BY_ID,
];

const INVENTORY_ENDPOINTS = [
  CREATE_STORE,
  CREATE_STOCK,
  GET_PRODUCTS_PAGINATED,
  GET_ALL_PRODUCTS,
  ASSIGN_ATTENDANT_PERMISSIONS,
  CREATE_INVOICE,
  EDIT_INVOICE,
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  GET_CUSTOMER_BY_ID,
  RETURN_CUSTOMER_EMPTIES,
  CREATE_CART,
  CHECKOUT_CART,
  GET_CART,
  UPDATE_CART_ITEM,
  DELETE_CART_ITEM,
  PAY_CART,
  UPDATE_ATTENDANT_PERMISSIONS,
  GET_ATTENDANT_PERMISSIONS,
  CREATE_EXPENSE,
  GET_EXPENSES,
  DELETE_EXPENSE,
  PAY_SUB,
  GET_SUPPLIERS,
  GET_PURCHASED_INVOICES,
  CREATE_PURCHASE,
  USER_STOCKS,
  UPDATE_STORE_SETTINGS,
  UPDATE_STORE,
  GET_SUBSCRIPTION_ME,
  GET_BUSINESS_REPORT_COMPARISON,
  STOCK_HISTORY,
  GET_SALES,
  GET_PURCHASE_REQUEST,
  GET_PURCHASE_REQUEST_BY_ID,
  GET_SALE_BY_ID,
  HAND_OVER_ITEM,
  SUCCESSFUL_HANDOVER,
  SUPPLIER_SALES,
  GET_STORE_ITEMS_SALES,
  CREATE_OFFER,
  UPDATE_STOCK_PRICES,
  GET_SUPPLIER_STORES,
  GET_STORE_STOCKS,
  PAY_CART_CREDIT_OTP,
  GET_CREDIT_LEDGER,
  RECORD_CREDIT_PAYMENT,
  GET_CREDIT_LEDGER_SUMMARY,
  GET_INVOICE_BY_ID,
  GET_MANUFACTURERS,
  GET_USER_STOCKS,
  RETURN_ITEMS,
  GET_CUSTOMERS,
  GET_STORE_STOCK_BY_ID,
  GET_MARKETPLACE_STOCKS,
  GET_MARKETPLACE_OFFERS,
  GET_OFFER_DETAIL,
  GET_MARKETPLACE_STOCK_DETAIL,
  GET_PRICING_PLANS,
  GET_STORES,
  GET_STORE_BY_ID,
  MOVE_STOCK,
  UPDATE_STOCK,
  GET_STOCK_DETAIL,
  GET_SUPPLIER_STOCKS,
  GET_SUPPLIER_STORES,
  DELETE_STOCKS_BULK,
  STOCK_CONDITIONS,
];

const LOGISTIC_ENDPOINTS: string[] = [];

const ALLOWED_ENDPOINTS = [
  ...VERA_ENDPOINTS,
  ...INVENTORY_ENDPOINTS,
  ...LOGISTIC_ENDPOINTS,
];

const getApiBaseUrl = (endpoint: string): string => {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (normalized.startsWith("/bids/")) return LOGISTIC_API_BASE_URL; // ✅ correct
  if (
    normalized.startsWith("/payment/") ||
    INVENTORY_ENDPOINTS.some(
      (e) =>
        typeof e === "string" &&
        (normalized.startsWith(e) || normalized.includes("inventory")),
    )
  ) {
    return INVENTORY_API_BASE_URL;
  }
  return VERA_API_BASE_URL;
};

const isValidEndpoint = (endpoint: string): boolean => {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const staticMatch = ALLOWED_ENDPOINTS.some((allowed) => {
    if (typeof allowed === "string") {
      if (allowed.startsWith("/"))
        return endpoint === allowed || endpoint.startsWith(allowed + "?");
      return (
        endpoint === allowed ||
        endpoint === `/${allowed}` ||
        endpoint.startsWith(`${allowed}?`) ||
        endpoint.startsWith(`/${allowed}?`)
      );
    }
    return false;
  });
  if (staticMatch) return true;
  if (
    normalized.match(/^\/client\/v1\/bank-accounts\/\d+$/) ||
    normalized.match(/^\/client\/v1\/bank-accounts\/accounts\/\d+$/) ||
    normalized.match(/^\/client\/v1\/loans\/\d+$/) ||
    normalized.match(/^\/client\/v1\/loans\/list\/repayment[-_]pattern.*$/) ||
    normalized.match(/^\/client\/v1\/bank-accounts\/accounts\/verify\/\d+$/) ||
    normalized.match(/^\/client\/v2\/wallet\/lookup.*$/) ||
    normalized.match(/^\/v1\/inventory\/.*$/) ||
    normalized.match(/^\/inventory\/.*$/) ||
    normalized.match(/^\/payment\/.*$/) ||
    normalized.match(/^\/bids\/track\/.+$/)
  ) {
    return true;
  }
  return false;
};

const getAuthToken = (request: Request): string | null => {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
    return cookies["authToken"];
  }
  return null;
};

const requestCounts = new Map<string, { count: number; timestamp: number }>();
const isRateLimited = (clientIp: string): boolean => {
  const now = Date.now();
  const clientData = requestCounts.get(clientIp);
  if (!clientData) {
    requestCounts.set(clientIp, { count: 1, timestamp: now });
    return false;
  }
  if (now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(clientIp, { count: 1, timestamp: now });
    return false;
  }
  if (clientData.count >= RATE_LIMIT) return true;
  clientData.count++;
  return false;
};

// POST Handler
// POST Handler - replace the try block with this
export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const contentType = request.headers.get("content-type") || "";
    let endpoint: string;
    let data: FormData | Record<string, unknown>;

    if (contentType.includes("multipart/form-data")) {
      const { searchParams } = new URL(request.url);
      endpoint = decodeURIComponent(searchParams.get("endpoint") || "");
      data = await request.formData();
    } else {
      const body = await request.json();
      endpoint = body.endpoint;
      data = body.data;
    }

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    if (!isValidEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Endpoint not allowed" },
        { status: 403 },
      );
    }

    const token = getAuthToken(request);
    const baseHeaders: Record<string, string> = {
      "x-api-key": API_KEY,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (!contentType.includes("multipart/form-data")) {
      baseHeaders["Content-Type"] = "application/json";
    }

    const secureHeaders = await addSecurityHeaders(
      baseHeaders,
      "POST",
      endpoint,
    );
    const apiBaseUrl = getApiBaseUrl(endpoint);

    const response = await fetch(
      `${apiBaseUrl}/${endpoint.replace(/^\//, "")}`,
      {
        method: "POST",
        headers: secureHeaders,
        body: contentType.includes("multipart/form-data")
          ? (data as FormData)
          : JSON.stringify(data),
      },
    );

    const responseData = await response.json();
    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });

    if (
      (endpoint === AUTH_SIGNIN_PATH || endpoint === SIGN_UP) &&
      responseData.status === "success"
    ) {
      const token = responseData.data?.tokens?.accessToken?.token;
      if (token) {
        nextResponse.cookies.set("authToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
      }
    }

    nextResponse.headers.set("X-Content-Type-Options", "nosniff");
    nextResponse.headers.set("X-Frame-Options", "DENY");
    nextResponse.headers.set("X-XSS-Protection", "1; mode=block");

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// GET Handler
export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }
    if (!isValidEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Endpoint not allowed" },
        { status: 403 },
      );
    }

    const forwardParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "endpoint") forwardParams.append(key, value);
    });
    const queryString = forwardParams.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

    const token = getAuthToken(request);
    const apiBaseUrl = getApiBaseUrl(endpoint);
    const isLogisticsEndpoint = apiBaseUrl === LOGISTIC_API_BASE_URL;

    const baseHeaders = {
      "x-api-key": API_KEY,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const headers = isLogisticsEndpoint
      ? baseHeaders
      : await addSecurityHeaders(baseHeaders, "GET", endpoint);

    const response = await fetch(
      `${apiBaseUrl}/${fullEndpoint.replace(/^\//, "")}`,
      { headers },
    );

    if (isLogisticsEndpoint) {
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
      const nextResponse = NextResponse.json(data, { status: response.status });
      nextResponse.headers.set("X-Content-Type-Options", "nosniff");
      nextResponse.headers.set("X-Frame-Options", "DENY");
      nextResponse.headers.set("X-XSS-Protection", "1; mode=block");
      return nextResponse;
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    nextResponse.headers.set("X-Content-Type-Options", "nosniff");
    nextResponse.headers.set("X-Frame-Options", "DENY");
    nextResponse.headers.set("X-XSS-Protection", "1; mode=block");
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// PUT Handler
export async function PUT(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const contentType = request.headers.get("content-type") || "";
    let endpoint: string;
    let data: FormData | Record<string, unknown>;

    if (contentType.includes("multipart/form-data")) {
      const { searchParams } = new URL(request.url);
      endpoint = decodeURIComponent(searchParams.get("endpoint") || "");
      data = await request.formData();
    } else {
      const body = await request.json();
      endpoint = body.endpoint;
      data = body.data;
    }

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }
    if (!isValidEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Endpoint not allowed" },
        { status: 403 },
      );
    }

    const token = getAuthToken(request);
    const baseHeaders: Record<string, string> = {
      "x-api-key": API_KEY,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (!contentType.includes("multipart/form-data")) {
      baseHeaders["Content-Type"] = "application/json";
    }

    const secureHeaders = await addSecurityHeaders(
      baseHeaders,
      "PUT",
      endpoint,
    );
    const apiBaseUrl = getApiBaseUrl(endpoint);

    const response = await fetch(
      `${apiBaseUrl}/${endpoint.replace(/^\//, "")}`,
      {
        method: "PUT",
        headers: secureHeaders,
        body: contentType.includes("multipart/form-data")
          ? (data as FormData)
          : JSON.stringify(data),
      },
    );

    const responseData = await response.json();
    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });
    nextResponse.headers.set("X-Content-Type-Options", "nosniff");
    nextResponse.headers.set("X-Frame-Options", "DENY");
    nextResponse.headers.set("X-XSS-Protection", "1; mode=block");
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE Handler
export async function DELETE(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }
    if (!isValidEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Endpoint not allowed" },
        { status: 403 },
      );
    }

    const token = getAuthToken(request);
    const baseHeaders: Record<string, string> = {
      "x-api-key": API_KEY,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const secureHeaders = await addSecurityHeaders(
      baseHeaders,
      "DELETE",
      endpoint,
    );
    const apiBaseUrl = getApiBaseUrl(endpoint);

    // Some deletes carry a payload (bulk stock delete sends { ids: [...] }),
    // so forward a JSON body when the caller supplied one.
    let deleteBody: string | undefined;
    try {
      const raw = await request.text();
      if (raw && raw.trim()) deleteBody = raw;
    } catch {
      /* no body — a plain DELETE */
    }

    const response = await fetch(
      `${apiBaseUrl}/${endpoint.replace(/^\//, "")}`,
      {
        method: "DELETE",
        headers: deleteBody
          ? { ...secureHeaders, "Content-Type": "application/json" }
          : secureHeaders,
        ...(deleteBody ? { body: deleteBody } : {}),
      },
    );

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    nextResponse.headers.set("X-Content-Type-Options", "nosniff");
    nextResponse.headers.set("X-Frame-Options", "DENY");
    nextResponse.headers.set("X-XSS-Protection", "1; mode=block");
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
