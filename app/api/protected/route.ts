/**
 * =============================================================================
 * PROTECTED API ROUTE - /api/protected
 * =============================================================================
 *
 * This is an example of a protected API route that requires authentication.
 * It demonstrates how to secure your API endpoints using the SDK.
 *
 * PATTERN:
 * 1. Get the session from the request cookies
 * 2. If no session, return 401 Unauthorized
 * 3. If session exists, proceed with the protected logic
 *
 * USE CASES:
 * - User profile endpoints
 * - Data modification endpoints
 * - Any API that should require authentication
 *
 * NOTE ON API vs PAGE PROTECTION:
 * - Pages: Protected by middleware (proxy.ts) - redirects to login
 * - APIs: Protected here by checking session - returns 401 JSON error
 *
 * APIs return errors instead of redirecting because:
 * - API clients (fetch, axios) need to handle auth differently
 * - The frontend can catch 401 and redirect to login
 * - Better developer experience for API consumers
 * =============================================================================
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  // Get the user's session from cookies
  // Returns null if not authenticated or session is invalid/expired
  const session = await auth.getSession();

  // No session = not authenticated
  // Return a 401 Unauthorized response with JSON error
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User is authenticated - return protected data
  // You can access user info via session.user:
  // - session.user.name, session.user.uid, session.user.email, etc.
  return NextResponse.json({
    message: 'This is a protected API route',
    session: session
  });
}
