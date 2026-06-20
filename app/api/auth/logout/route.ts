import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect(
    new URL('/signin', process.env.CLIENT_ORIGIN || 'https://app.vendcliq.com')
  );
  
  response.cookies.set('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  // Also clear any other HTTP-only cookies
  response.cookies.set('userRole', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  response.cookies.set('userPermissions', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}