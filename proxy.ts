/**
 * =============================================================================
 * MIDDLEWARE / PROXY - proxy.ts
 * =============================================================================
 *
 * This file implements Next.js middleware for route protection. It intercepts
 * requests before they reach your pages and can redirect unauthenticated users.
 *
 * HOW IT WORKS:
 * 1. Next.js calls proxy() for every request matching the `config.matcher` pattern
 * 2. We check if the user has a valid session cookie
 * 3. If not authenticated, redirect to login with a returnTo parameter
 * 4. If authenticated, allow the request to continue
 *
 * WHY USE MIDDLEWARE FOR AUTH?
 * - Protects routes BEFORE rendering (no flash of protected content)
 * - Centralizes authentication logic in one place
 * - Works for both pages and API routes
 * - Better performance than checking auth in every page component
 *
 * DEPLOYMENT NOTE:
 * On Netlify, this runs as an Edge Function. The session secret is inlined
 * at build time when the vault plugin has loaded environment variables.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://github.com/SU-SWS/weblogin-auth-sdk/blob/main/docs/edge-functions.md
 * =============================================================================
 */

import { createEdgeSessionReader } from 'weblogin-auth-sdk/edge-session';
import { NextRequest, NextResponse } from 'next/server';

// Load environment variables from .env file at BUILD TIME only.
// This is needed because the vault plugin writes secrets to .env during the build.
// We check for EdgeRuntime to avoid running dotenv in the edge environment.
// @ts-expect-error - EdgeRuntime is a global in edge environments
if (typeof EdgeRuntime === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
}

/**
 * Session secret inlined at build time.
 *
 * IMPORTANT: This value is read from process.env during the Next.js build
 * (after the vault plugin has loaded secrets) and baked into the edge function
 * bundle. This is safe because:
 * 1. Edge function bundles are server-side only (never sent to client)
 * 2. The secret is needed at runtime but env vars aren't available in edge
 * 3. The vault plugin loads secrets during onPreBuild, before Next.js builds
 */
const SESSION_SECRET = process.env.WEBLOGIN_AUTH_SESSION_SECRET!;

/**
 * Pre-configured edge session reader.
 * Created at module load time with the build-time inlined secret.
 */
const sessionReader = createEdgeSessionReader(
  SESSION_SECRET,
  'weblogin-auth' // cookie name
);

/**
 * Middleware function that runs on every matching request.
 *
 * Uses the edge-compatible EdgeSessionReader for session validation.
 * This is lightweight and works in edge function environments where
 * Node.js APIs are not available.
 *
 * @param request - The incoming Next.js request object
 * @returns NextResponse - Either a redirect to login or continuation to the page
 *
 * FLOW:
 * Request → Middleware checks session → Authenticated? → Yes: Continue to page
 *                                                     → No: Redirect to /api/auth/login
 */
export async function proxy(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/protected')) {
    try {
      // Check if the user has a valid session
      const isAuthenticated = await sessionReader.isAuthenticated(request);

      // No valid session means user is not authenticated
      if (!isAuthenticated) {
        // Build the login URL with a returnTo parameter
        // This ensures users come back to their original destination after login
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);

        // Redirect to the login endpoint
        // The SDK will then redirect to Stanford's IdP for authentication
        return NextResponse.redirect(loginUrl);
      }
    } catch (err) {
      console.error('Unauthorized User in Middleware', err);
      // On error, redirect to login
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // User is authenticated (or route doesn't require auth) - continue normally
  return NextResponse.next();
}

/**
 * ROUTE MATCHER CONFIGURATION
 *
 * The `matcher` array defines which routes this middleware applies to.
 * Only requests matching these patterns will trigger the proxy() function.
 *
 * PATTERN SYNTAX:
 * - '/protected/:path*' matches /protected, /protected/foo, /protected/foo/bar
 * - The :path* is a wildcard that captures any sub-path
 *
 * EXAMPLES OF WHAT THIS MATCHES:
 * ✓ /protected
 * ✓ /protected/dashboard
 * ✓ /protected/users/123
 *
 * EXAMPLES OF WHAT THIS DOESN'T MATCH:
 * ✗ / (home page)
 * ✗ /api/auth/login
 * ✗ /session (not under /protected)
 *
 * TIP: You can add more patterns to protect additional routes:
 * matcher: ['/protected/:path*', '/admin/:path*', '/dashboard/:path*']
 */
export const config = {
  matcher: ['/protected/:path*'],
};
