import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect(new URL('/login', process.env.CLIENT_ORIGIN || 'https://app.vendcliq.com'));
  
  // Clear the auth cookie
  response.cookies.set('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0)
  });

  return response;
} 