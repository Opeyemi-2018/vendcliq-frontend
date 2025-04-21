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
} from '@/url/api-url';

// Add dynamic configuration
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

// Authentication constants
const AUTH_SIGNIN_PATH = SIGN_IN;
const AUTH_COOKIE_MAX_AGE = parseInt(process.env.AUTH_COOKIE_MAX_AGE as string || '86400', 10); // 24 hours in seconds

// Rate limiting configuration
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT as string || '100', 10); // requests per minute
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW as string || '60000', 10); // 1 minute in ms

// Function to generate security signature using Web Crypto API
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

// Function to add security headers required by origin_security_middleware
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

// Allowed endpoints whitelist
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
  VERIFY_BANK_ACCOUNT,
  LIST_BANKS,
];

// Helper function to validate endpoint
const isValidEndpoint = (endpoint: string): boolean => {
  return ALLOWED_ENDPOINTS.some(allowed => 
    endpoint.startsWith(allowed) || 
    endpoint.match(new RegExp(`^${allowed}\\?.*$`))
  );
};

// Helper function to get auth token from cookies or header
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

    // Validate request body
    const body = await request.json();
    const { endpoint, data } = body;

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
    const baseHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY as string,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Add security headers required by origin_security_middleware
    const secureHeaders = await addSecurityHeaders(baseHeaders, 'POST', endpoint);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: secureHeaders,
      body: JSON.stringify(data)
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

    // Validate endpoint against whitelist
    if (!isValidEndpoint(endpoint)) {
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
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 