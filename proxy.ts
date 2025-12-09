import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';

// Load .env file for edge function bundling
dotenv.config();

export async function proxy(request: NextRequest) {
  // Protect /protected routes
  if (request.nextUrl.pathname.startsWith('/protected')) {
    const session = await auth.getSession(request);
    if (!session) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};
