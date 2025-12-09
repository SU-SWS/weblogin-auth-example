/**
 * =============================================================================
 * CALLBACK ROUTE - /api/auth/callback (ACS URL)
 * =============================================================================
 *
 * This is the Assertion Consumer Service (ACS) URL - the endpoint where
 * Stanford's IdP sends the SAML response after user authentication.
 *
 * FLOW:
 * 1. User authenticates at Stanford's IdP
 * 2. IdP POSTs a SAML response to this endpoint
 * 3. auth.authenticate() validates the response and extracts user data
 * 4. SDK creates an encrypted session cookie with user info
 * 5. User is redirected to their original destination (returnTo)
 *
 * WHY POST?
 * SAML responses are sent via HTTP POST binding for security - the response
 * is too large for a URL and contains sensitive signed/encrypted data.
 *
 * WHAT auth.authenticate() DOES:
 * 1. Parses the SAML response from the request body
 * 2. Validates the signature (ensures it came from Stanford's IdP)
 * 3. Decrypts the assertion (if encrypted)
 * 4. Extracts user attributes (name, email, SUNetID, etc.)
 * 5. Creates an encrypted session cookie
 * 6. Returns user data and the returnTo URL
 *
 * REGISTRATION REQUIREMENT:
 * This URL must be registered with Stanford IT as your ACS endpoint.
 * It should match: {returnToOrigin}/api/auth/callback
 * =============================================================================
 */

import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  // Process the SAML response and create a session
  // This handles all validation, decryption, and session creation
  const { returnTo, user, session } = await auth.authenticate(request);

  // At this point you have access to the authenticated user's data!
  // Common user attributes from Stanford's IdP:
  // - user.name: Display name (e.g., "John Doe")
  // - user.uid: SUNetID (e.g., "jdoe")
  // - user.email: Email address
  // - user.eduPersonAffiliation: Stanford affiliation(s)
  //
  // You could use this data to:
  // - Create/update a user record in your database
  // - Set up role-based access control
  // - Log authentication events
  // console.log('Authenticated user:', user);
  // console.log('Session data:', session);

  // Redirect to the original destination (or /session as fallback)
  const redirectUrl = returnTo || '/session';
  return Response.redirect(new URL(redirectUrl, request.url));
}
