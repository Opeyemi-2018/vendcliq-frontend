/**
 * API Route Handler for /api/client
 * Secure proxy between frontend and backend APIs (VERA + INVENTORY)
 */

import { NextResponse } from "next/server";
import {
  // v2 endpoint

  VERIFY_EMAIL,
  CONFIRM_PHONE_NUMBER,
  SIGN_IN,
  SIGN_UP,
  VERIFY_PHONE_NUMBER,
  VALIDATE_BVN,
  REQUEST_BVN_TOKEN,
  VERIFY_BVN_TOKEN,
  UPLOAD_BUSINESS_VERIFICATION,
  CHANGE_PASSWORD,
  SEND_OTP_FOR_FORGET_PASSWORD,
  RESET_PASSWORD,
  CREATE_PASSWORD,
  CREATE_BUSINESS_DETAILS,
  RESEND_VERIFICATION_TOKEN,
  CREATE_STORE,
  CREATE_STOCK,
  GET_PRODUCTS,
  TRANSACTION_HISTORY,
  VENDCLIQ_TRANSFER,
  OTHERBANK_TRANSFER,
  BUY_AIRTIME,
  BUY_DATA,
  PIN_VALIDATE,
  CREATE_WALLET,
  ADD_SHOP_ATTENDANT,
  CREATE_INVOICE,
  CREATE_CUSTOMER,
  CREATE_CART,
  CHECKOUT_CART,
  PAY_CART,

  // v1 endpoint

  // GET_PROFILE,
  // DASHBOARD,
  // BUSINESS_INFORMATION_SETUP_STEP_ONE,
  // BUSINESS_INFORMATION_SETUP_STEP_TWO,
  // IDENTITY_UPLOAD,
  // CREATE_LOAN,
  // LIST_BANKS,
  // VERIFY_BANK_ACCOUNT,
  // RESEND_EMAIL_OTP,
  // CREATE_PIN,
  // UPDATE_PIN,
  // REQUEST_PIN_TOKEN,
  // GET_TENURES,
  // POST_REPAYMENT_PATTERN,
  // GET_LOAN,
  // GET_BANK_ACCOUNT,
  // GET_ACCOUNT,
  // LOAN_STAT_DETAILS,
  // OUTSIDE_TRANSFER,
  // LOCAL_TRANSFER,
  // GET_ACCOUNT_BY_ID,
  // GET_ACCOUNT_DETAILS_BY_ID,
} from "@/url/api-url";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// API Base URLs
const VERA_API_BASE_URL = process.env.VERA_API_BASE_URL as string;
const INVENTORY_API_BASE_URL = process.env
  .VERA_INVENTORY_API_BASE_URL as string;

if (!VERA_API_BASE_URL) throw new Error("VERA_API_BASE_URL not set");
if (!INVENTORY_API_BASE_URL)
  throw new Error("VERA_INVENTORY_API_BASE_URL not set");

const API_KEY = process.env.PRODUCT_API_KEY as string;
if (!API_KEY) throw new Error("PRODUCT_API_KEY not set");

const CLIENT_ID = process.env.CLIENT_ID as string;
if (!CLIENT_ID) throw new Error("CLIENT_ID not set");

const CLIENT_VERSION = process.env.CLIENT_VERSION as string;
if (!CLIENT_VERSION) throw new Error("CLIENT_VERSION not set");

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN as string;
if (!CLIENT_ORIGIN) throw new Error("CLIENT_ORIGIN not set");

const APP_SECRET_KEY = process.env.APP_SECRET_KEY as string;
if (!APP_SECRET_KEY) throw new Error("APP_SECRET_KEY not set");

const AUTH_SIGNIN_PATH = SIGN_IN;

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || "100", 10);
const RATE_LIMIT_WINDOW = parseInt(
  process.env.RATE_LIMIT_WINDOW || "60000",
  10
);

// Security Signature
const generateSignature = async (
  clientId: string,
  timestamp: string,
  method: string,
  path: string
): Promise<string> => {
  const data = `${clientId}:${timestamp}:${method}:${path}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(APP_SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
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
  path: string
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
  // v2 endpoint
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
  VENDCLIQ_TRANSFER,
  PIN_VALIDATE,
  OTHERBANK_TRANSFER,
  BUY_AIRTIME,
  BUY_DATA,
  CREATE_WALLET,

  // v1 endpoint
  // GET_PROFILE,
  // DASHBOARD,
  // CREATE_PIN,
  // UPDATE_PIN,

  // BUSINESS_INFORMATION_SETUP_STEP_ONE,
  // BUSINESS_INFORMATION_SETUP_STEP_TWO,
  // IDENTITY_UPLOAD,
  // RESEND_EMAIL_OTP,
  // REQUEST_PIN_TOKEN,

  // LOAN_STAT_DETAILS,
  // GET_LOAN,
  // GET_TENURES,
  // POST_REPAYMENT_PATTERN,
  // CREATE_LOAN,

  // OUTSIDE_TRANSFER,
  // LOCAL_TRANSFER,
  // GET_ACCOUNT,
  // GET_BANK_ACCOUNT,
  // GET_ACCOUNT_BY_ID,
  // GET_ACCOUNT_DETAILS_BY_ID,
  // VERIFY_BANK_ACCOUNT,
  // LIST_BANKS,
];

const INVENTORY_ENDPOINTS = [
  CREATE_STORE,
  CREATE_STOCK,
  GET_PRODUCTS,
  ADD_SHOP_ATTENDANT,
  CREATE_INVOICE,
  CREATE_CUSTOMER,
  CREATE_CART,
  CHECKOUT_CART,
  PAY_CART,
];

const ALLOWED_ENDPOINTS = [...VERA_ENDPOINTS, ...INVENTORY_ENDPOINTS];

// API Base URL Router
const getApiBaseUrl = (endpoint: string): string => {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (
    INVENTORY_ENDPOINTS.some(
      (e) =>
        typeof e === "string" &&
        (normalized.startsWith(e) || normalized.includes("inventory"))
    )
  ) {
    return INVENTORY_API_BASE_URL;
  }
  return VERA_API_BASE_URL;
};

// Endpoint Validation
const isValidEndpoint = (endpoint: string): boolean => {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const staticMatch = ALLOWED_ENDPOINTS.some((allowed) => {
    if (typeof allowed === "string") {
      if (allowed.startsWith("/")) {
        return endpoint === allowed || endpoint.startsWith(allowed + "?");
      }
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
    normalized.match(/^\/v1\/inventory\/.*$/) ||
    normalized.match(/^\/inventory\/.*$/)
  ) {
    return true;
  }

  return false;
};

// Auth Token
const getAuthToken = (request: Request): string | null => {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies["authToken"];
  }
  return null;
};

// Rate Limiting
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
        { status: 403 }
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
      endpoint
    );

    const apiBaseUrl = getApiBaseUrl(endpoint);

    console.log(`Routing POST ${endpoint} to ${apiBaseUrl}`);

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers: secureHeaders,
      body: contentType.includes("multipart/form-data")
        ? (data as FormData)
        : JSON.stringify(data),
    });

    const responseData = await response.json();
    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });

    if (endpoint === AUTH_SIGNIN_PATH && responseData.status === "success") {
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
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
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
        { status: 403 }
      );
    }

    const token = getAuthToken(request);

    const baseHeaders = {
      "x-api-key": API_KEY,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const secureHeaders = await addSecurityHeaders(
      baseHeaders,
      "GET",
      endpoint
    );

    const apiBaseUrl = getApiBaseUrl(endpoint);

    console.log(`Routing GET ${endpoint} to ${apiBaseUrl}`);

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: secureHeaders,
    });

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });

    nextResponse.headers.set("X-Content-Type-Options", "nosniff");
    nextResponse.headers.set("X-Frame-Options", "DENY");
    nextResponse.headers.set("X-XSS-Protection", "1; mode=block");

    return nextResponse;
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT Handler - almost identical to POST
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
        { status: 403 }
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

    // Important: pass "PUT" as method for signature
    const secureHeaders = await addSecurityHeaders(
      baseHeaders,
      "PUT",  // ← This was "POST" before — now correct
      endpoint
    );

    const apiBaseUrl = getApiBaseUrl(endpoint);

    console.log(`Routing PUT ${endpoint} to ${apiBaseUrl}`);

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: "PUT",  // ← Forward as PUT
      headers: secureHeaders,
      body: contentType.includes("multipart/form-data")
        ? (data as FormData)
        : JSON.stringify(data),
    });

    const responseData = await response.json();
    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });

    nextResponse.headers.set("X-Content-Type-Options", "nosniff");
    nextResponse.headers.set("X-Frame-Options", "DENY");
    nextResponse.headers.set("X-XSS-Protection", "1; mode=block");

    return nextResponse;
  } catch (error) {
    console.error("API proxy PUT error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
