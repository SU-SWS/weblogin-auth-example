/**
 * =============================================================================
 * LOGOUT ROUTE - /api/auth/logout
 * =============================================================================
 *
 * This endpoint destroys the user's session and redirects them to the home page.
 *
 * WHAT auth.logout() DOES:
 * 1. Reads the session cookie from the request
 * 2. Clears/invalidates the session data
 * 3. Sets a cookie header to delete the session cookie in the browser
 *
 * IMPORTANT NOTES:
 * - This is a "local" logout - it ends the session with YOUR app
 * - It does NOT end the user's session with Stanford's IdP
 * - To fully logout from Stanford, redirect to Stanford's logout URL
 *
 * HARD NAVIGATION:
 * The logout link should use a regular <a> tag (not Next.js Link) to trigger
 * a full page reload. This ensures the Header component re-renders and shows
 * the correct auth state. See Header.tsx for implementation.
 * =============================================================================
 */

import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  // Destroy the user's session - this clears their auth cookie
  await auth.logout();

  // Redirect to the home page after logout
  // Using the base URL ensures we redirect to the correct domain
  const url = new URL('/', request.url);
  return Response.redirect(url);
}
