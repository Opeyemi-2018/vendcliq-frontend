/**
 * API Route Handler for /api/client
 * 
 * This route handler acts as a secure proxy between the frontend and the backend API.
 * It provides several security features and validations:
 * 
 * 1. Rate Limiting: Prevents abuse by limiting requests per IP
 * 2. Authentication: Manages auth tokens and session cookies
 * 3. Request Validation: Validates endpoints against whitelist
 * 4. Security Headers: Adds required security headers and signatures
 * 5. Content Type Handling: Supports both JSON and multipart/form-data
 * 
 * Environment Variables Required:
 * - VERA_API_BASE_URL: Base URL of the backend API
 * - PRODUCT_API_KEY: API key for backend authentication
 * - CLIENT_ID: Client identifier for request signing
 * - CLIENT_VERSION: Client version for request tracking
 * - CLIENT_ORIGIN: Allowed origin for CORS
 * - APP_SECRET_KEY: Secret key for request signing
 * - AUTH_COOKIE_MAX_AGE: (optional) Cookie lifetime in seconds (default: 86400)
 * - RATE_LIMIT: (optional) Requests per minute per IP (default: 100)
 * - RATE_LIMIT_WINDOW: (optional) Rate limit window in ms (default: 60000)
 */

import { NextResponse } from 'next/server';
import {
  VERIFY_EMAIL,
  CONFIRM_PHONE_NUMBER,
  SIGN_IN,
  SIGN_UP,
  VERIFY_PHONE_NUMBER,
  GET_PROFILE,
  DASHBOARD,
  BUSINESS_INFORMATION_SETUP_STEP_ONE,
  BUSINESS_INFORMATION_SETUP_STEP_TWO,
  IDENTITY_UPLOAD,
  CREATE_LOAN,
  LIST_BANKS,
  VERIFY_BANK_ACCOUNT,
  RESEND_EMAIL_OTP,
  CHANGE_PASSWORD,
  CREATE_PIN,
  UPDATE_PIN,
  REQUEST_PIN_TOKEN,
  GET_TENURES,
  POST_REPAYMENT_PATTERN,
  GET_LOAN,
  INVENTORY_LIST,
  SEND_OTP_FOR_FORGET_PASSWORD,
  RESET_PASSWORD,
  GET_BANK_ACCOUNT,
  RESEND_VERIFICATION_TOKEN,
  TRANSACTION_HISTORY,
  GET_ACCOUNT,
  LOAN_STAT_DETAILS,
  OUTSIDE_TRANSFER,
  LOCAL_TRANSFER,
  GET_ACCOUNT_BY_ID,
  GET_ACCOUNT_DETAILS_BY_ID,
} from '@/url/api-url';

// Configure route handler for dynamic responses and edge runtime
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const API_BASE_URL = process.env.VERA_API_BASE_URL as string;
if (!API_BASE_URL) {
  throw new Error('VERA_API_BASE_URL environment variable is not set');
}

const API_KEY = process.env.PRODUCT_API_KEY as string;
if (!API_KEY) {
  throw new Error('PRODUCT_API_KEY environment variable is not set');
}

const CLIENT_ID = process.env.CLIENT_ID as string;
if (!CLIENT_ID) {
  throw new Error('CLIENT_ID environment variable is not set');
}

const CLIENT_VERSION = process.env.CLIENT_VERSION as string;
if (!CLIENT_VERSION) {
  throw new Error('CLIENT_VERSION environment variable is not set');
}

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN as string;
if (!CLIENT_ORIGIN) {
  throw new Error('CLIENT_ORIGIN environment variable is not set');
}

const APP_SECRET_KEY = process.env.APP_SECRET_KEY as string;
if (!APP_SECRET_KEY) {
  throw new Error('APP_SECRET_KEY environment variable is not set');
}

/**
 * Authentication Constants
 * - AUTH_SIGNIN_PATH: Endpoint for sign-in requests
 * - AUTH_COOKIE_MAX_AGE: Cookie lifetime in seconds (24 hours default)
 */
const AUTH_SIGNIN_PATH = SIGN_IN;
const AUTH_COOKIE_MAX_AGE = parseInt(process.env.AUTH_COOKIE_MAX_AGE as string || '86400', 10);

/**
 * Rate Limiting Configuration
 * Implements a simple in-memory rate limiting strategy
 */
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT as string || '100', 10);
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW as string || '60000', 10);

/**
 * Generates a security signature for request authentication
 * Uses HMAC-SHA256 for secure request signing
 * 
 * @param clientId - Client identifier
 * @param timestamp - Current timestamp
 * @param method - HTTP method
 * @param path - Request path
 * @returns Promise<string> - Hex-encoded signature
 */
const generateSignature = async (clientId: string, timestamp: string, method: string, path: string): Promise<string> => {
  const data = `${clientId}:${timestamp}:${method}:${path}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(APP_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Adds required security headers to requests
 * Headers include:
 * - Client identification (id, version, device)
 * - Request timestamp
 * - Security signature
 * - Origin validation
 * 
 * @param headers - Existing headers
 * @param method - HTTP method
 * @param path - Request path
 * @returns Promise<Record<string, string>> - Headers with security additions
 */
const addSecurityHeaders = async (headers: Record<string, string>, method: string, path: string): Promise<Record<string, string>> => {
  const timestamp = Date.now().toString();
  const clientId = CLIENT_ID;
  const signature = await generateSignature(clientId, timestamp, method, path);
 
  return {
    ...headers,
    'x-client-timestamp': timestamp,
    'x-client-id': clientId,
    'x-client-version': CLIENT_VERSION,
    'x-client-device': 'web', 
    'x-request-signature': signature,
    'origin': CLIENT_ORIGIN, 
  };
};

/**
 * Whitelist of allowed endpoints
 * Grouped by functionality for better organization
 * New endpoints must be added here to be accessible
 */
const ALLOWED_ENDPOINTS = [
  // Auth & Profile
  SIGN_IN,
  SIGN_UP,
  GET_PROFILE,
  VERIFY_EMAIL,
  RESEND_VERIFICATION_TOKEN,
  SEND_OTP_FOR_FORGET_PASSWORD,
  RESET_PASSWORD,
  CHANGE_PASSWORD,
  CREATE_PIN,
  UPDATE_PIN,
  VERIFY_PHONE_NUMBER,
  CONFIRM_PHONE_NUMBER,
  BUSINESS_INFORMATION_SETUP_STEP_ONE,
  BUSINESS_INFORMATION_SETUP_STEP_TWO,
  IDENTITY_UPLOAD,
  RESEND_EMAIL_OTP,
  REQUEST_PIN_TOKEN,

  // Dashboard & Core Features
  DASHBOARD,
  LOAN_STAT_DETAILS,
  INVENTORY_LIST,

  // Loans
  GET_LOAN,
  GET_TENURES,
  POST_REPAYMENT_PATTERN,
  CREATE_LOAN,

  // Transactions & Transfers
  TRANSACTION_HISTORY,
  OUTSIDE_TRANSFER,
  LOCAL_TRANSFER,

  // Bank Accounts
  GET_ACCOUNT,
  GET_BANK_ACCOUNT,
  GET_ACCOUNT_BY_ID,
  GET_ACCOUNT_DETAILS_BY_ID,
  VERIFY_BANK_ACCOUNT,
  LIST_BANKS,
];

/**
 * Validates if an endpoint is allowed
 * Supports both static endpoints and dynamic patterns
 * 
 * @param endpoint - Endpoint to validate
 * @returns boolean - Whether the endpoint is valid
 */
const isValidEndpoint = (endpoint: string): boolean => {
  // Ensure endpoint starts with a slash for pattern matching
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Check for static endpoints
  const staticMatch = ALLOWED_ENDPOINTS.some(allowed => {
    if (typeof allowed === 'string') {
      // For static endpoints, check if they match exactly or with query parameters
      if (allowed.startsWith('/')) {
        return endpoint === allowed || endpoint.startsWith(allowed + '?');
      } else {
        // Handle endpoints without leading slash
        return endpoint === allowed || 
               endpoint === `/${allowed}` || 
               endpoint.startsWith(`${allowed}?`) || 
               endpoint.startsWith(`/${allowed}?`);
      }
    }
    return false;
  });
  
  if (staticMatch) return true;
  
  // Check for dynamic endpoints patterns
  if (normalizedEndpoint.match(/^\/client\/v1\/bank-accounts\/\d+$/) ||
      normalizedEndpoint.match(/^\/client\/v1\/bank-accounts\/accounts\/\d+$/)) {
    return true;
  }
  
  if (normalizedEndpoint.match(/^\/client\/v1\/loans\/\d+$/)) {
    return true;
  }

  if (normalizedEndpoint.match(/^\/client\/v1\/loans\/list\/repayment-pattern\?tenure=\d+(%20|\+)?(?:weeks?|months?)$/)) {
    return true;
  }
  
  if (normalizedEndpoint.match(/^\/client\/v1\/bank-accounts\/accounts\/verify\/\d+$/)) {
    return true;
  }
  
  return false;
};

/**
 * Extracts authentication token from request
 * Checks both Authorization header and cookies
 * 
 * @param request - Incoming request
 * @returns string | null - Auth token if found
 */
const getAuthToken = (request: Request): string | null => {
  // First try to get from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Then try to get from cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as { [key: string]: string });
    
    return cookies['authToken'];
  }
  
  return null;
};

// Rate limiting implementation
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

  if (clientData.count >= RATE_LIMIT) {
    return true;
  }

  clientData.count++;
  return false;
};

/**
 * POST request handler
 * Handles both JSON and multipart/form-data requests
 * Supports file uploads and regular API requests
 * 
 * Features:
 * - Rate limiting
 * - Endpoint validation
 * - Authentication
 * - Security headers
 * - Error handling
 * 
 * @param request - Incoming request
 * @returns Promise<NextResponse> - API response
 */
export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Check rate limit
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Check content type
    const contentType = request.headers.get('content-type') || '';
    let endpoint: string;
    let data: FormData | Record<string, unknown>;

    if (contentType.includes('multipart/form-data')) {
      // For multipart/form-data, get the endpoint from the URL search params
      const { searchParams } = new URL(request.url);
      endpoint = decodeURIComponent(searchParams.get('endpoint') || '');
      // Pass through the FormData as is
      data = await request.formData();
    } else {
      // For JSON requests, get endpoint and data from body
    const body = await request.json();
      endpoint = body.endpoint;
      data = body.data;
    }

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json(
        { error: 'Invalid endpoint' },
        { status: 400 }
      );
    }

    // Validate endpoint against whitelist
    if (!isValidEndpoint(endpoint)) {
      return NextResponse.json(
        { error: 'Endpoint not allowed' },
        { status: 403 }
      );
    }

    const token = getAuthToken(request);
    
    // Create base headers
    const baseHeaders: Record<string, string> = {
      'x-api-key': API_KEY as string,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // For multipart/form-data, don't set Content-Type header - let the browser set it with boundary
    if (!contentType.includes('multipart/form-data')) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    // Add security headers required by origin_security_middleware
    const secureHeaders = await addSecurityHeaders(baseHeaders, 'POST', endpoint);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: secureHeaders,
      body: contentType.includes('multipart/form-data') ? data as FormData : JSON.stringify(data)
    });

    const responseData = await response.json();
    const nextResponse = NextResponse.json(responseData, { status: response.status });

    // If this is a login/authentication endpoint and login was successful
    if (endpoint === AUTH_SIGNIN_PATH && responseData.status === 'success') {
      const token = responseData.data.token.token;
      
      // Set the cookie with strict security options
      nextResponse.cookies.set('authToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: AUTH_COOKIE_MAX_AGE
      });
    }

    // Add security headers to response
    nextResponse.headers.set('X-Content-Type-Options', 'nosniff');
    nextResponse.headers.set('X-Frame-Options', 'DENY');
    nextResponse.headers.set('X-XSS-Protection', '1; mode=block');

    return nextResponse;
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * GET request handler
 * Handles API requests that fetch data
 * 
 * Features:
 * - Rate limiting
 * - Endpoint validation
 * - Authentication
 * - Security headers
 * - Error handling
 * 
 * @param request - Incoming request
 * @returns Promise<NextResponse> - API response
 */
export async function GET(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Check rate limit
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json(
        { error: 'Invalid endpoint' },
        { status: 400 }
      );
    }

    const isValid = isValidEndpoint(endpoint);
    // Validate endpoint against whitelist
    if (!isValid) {
      return NextResponse.json(
        { error: 'Endpoint not allowed' },
        { status: 403 }
      );
    }

    const token = getAuthToken(request);
    
    // Create base headers
    const baseHeaders = {
        'x-api-key': API_KEY as string,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Add security headers required by origin_security_middleware
    const secureHeaders = await addSecurityHeaders(baseHeaders, 'GET', endpoint);    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: secureHeaders
      });

    const data = await response.json();
      const nextResponse = NextResponse.json(data, { status: response.status });

      // Add security headers to response
      nextResponse.headers.set('X-Content-Type-Options', 'nosniff');
      nextResponse.headers.set('X-Frame-Options', 'DENY');
      nextResponse.headers.set('X-XSS-Protection', '1; mode=block');

      return nextResponse;
    } catch (fetchError: unknown) {
      return NextResponse.json(
        { error: 'Error fetching from API', details: fetchError instanceof Error ? fetchError.message : String(fetchError) },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 