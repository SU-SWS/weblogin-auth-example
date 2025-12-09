/**
 * =============================================================================
 * LOGIN ROUTE - /api/auth/login
 * =============================================================================
 *
 * This endpoint initiates the SAML authentication flow by redirecting users
 * to Stanford's Identity Provider (IdP).
 *
 * FLOW:
 * 1. User clicks "Login" button → GET /api/auth/login
 * 2. This route calls auth.login() which generates a SAML AuthnRequest
 * 3. User is redirected to Stanford's IdP (login.stanford.edu)
 * 4. User authenticates with their Stanford credentials
 * 5. IdP redirects back to /api/auth/callback with SAML response
 *
 * QUERY PARAMETERS:
 * - returnTo: Where to send user after successful login (default: /session)
 *
 * EXAMPLE USAGE:
 * <a href="/api/auth/login">Login</a>
 * <a href="/api/auth/login?returnTo=/dashboard">Login to Dashboard</a>
 * =============================================================================
 */

import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  // Extract the returnTo parameter from the query string
  // This preserves the user's intended destination through the auth flow
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/session';

  // Origin, or where this site is to redirect back to after login
  // This is needed to build the full ACS URL in the SAML request
  const origin = new URL(request.url).origin;

  // auth.login() creates a SAML AuthnRequest and returns a redirect response
  // to Stanford's IdP. The SDK handles all the SAML complexity internally.
  return auth.login({ returnTo, origin });
}
