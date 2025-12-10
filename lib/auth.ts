/**
 * =============================================================================
 * AUTH CONFIGURATION - lib/auth.ts
 * =============================================================================
 *
 * This file initializes the Weblogin Auth SDK for Stanford SAML authentication.
 * It's the central configuration point for all authentication functionality.
 *
 * KEY CONCEPTS:
 * - The SDK handles SAML authentication with Stanford's Identity Provider (IdP)
 * - Sessions are encrypted and stored in cookies
 * - Configuration requires SAML certificates and keys from Stanford IT
 *
 * LAZY INITIALIZATION:
 * We use lazy initialization (creating the auth instance on first use) instead
 * of creating it at module load time. This is critical for deployment platforms
 * like Netlify where edge functions are bundled before environment variables
 * are available. Without lazy loading, the SDK would throw errors during the
 * build process when it can't find the required configuration.
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 * - WEBLOGIN_AUTH_SAML_ENTITY: Your SP entity ID (registered with Stanford)
 * - WEBLOGIN_AUTH_SAML_RETURN_ORIGIN: Where users return after login
 * - WEBLOGIN_AUTH_SAML_PRIVATE_KEY: RSA private key for signing SAML requests
 * - WEBLOGIN_AUTH_SAML_CERT: X.509 certificate matching the private key
 * - WEBLOGIN_AUTH_SAML_DECRYPTION_KEY: RSA private key for decrypting assertions
 * - WEBLOGIN_AUTH_SAML_DECRYPTION_CERT: X.509 certificate for encryption
 * - WEBLOGIN_AUTH_SESSION_SECRET: Random string for encrypting session cookies
 *
 * @see https://github.com/SU-SWS/weblogin-auth-sdk for full documentation
 * =============================================================================
 */

import { createWebLoginNext } from 'weblogin-auth-sdk/next';
import { idps } from 'weblogin-auth-sdk';

// Lazy initialization to avoid config validation during edge function bundling
let _auth: ReturnType<typeof createWebLoginNext> | null = null;

/**
 * Get or create the auth instance (singleton pattern).
 *
 * This function creates the auth instance once and reuses it for all
 * subsequent calls. This defers initialization until runtime when
 * environment variables are available.
 *
 * @returns The configured auth instance
 */
export function getAuth() {
  if (!_auth) {
    _auth = createWebLoginNext({
      /**
       * SAML CONFIGURATION
       * These settings configure the SAML Service Provider (SP) that
       * communicates with Stanford's Identity Provider (IdP).
       */
      saml: {
        // issuer: Your SP Entity ID - must match Stanford registration
        issuer: process.env.WEBLOGIN_AUTH_SAML_ENTITY!,

        // Use the SDK's built-in IdP presets (prod or uat)
        entryPoint: idps.prod.entryPoint,
        idpCert: idps.prod.cert,

        // Base URL for callback - SDK appends /api/auth/callback
        returnToOrigin: process.env.URL || process.env.WEBLOGIN_AUTH_SAML_RETURN_ORIGIN!,

        // ACS URL path where SAML responses are sent
        returnToPath: '/api/auth/callback',

        // SIGNING KEYS: Sign outgoing SAML requests for verification
        privateKey: process.env.WEBLOGIN_AUTH_SAML_PRIVATE_KEY!,
        cert: process.env.WEBLOGIN_AUTH_SAML_CERT!,

        // Sign metadata XML (required when skipRequestAcsUrl is true)
        signMetadata: true,

        // Use current ACS URL from metadata instead of hardcoded one in IDP.
        skipRequestAcsUrl: process.env.WEBLOGIN_AUTH_SAML_SKIP_ACS_VALIDATION === 'true',

        // DECRYPTION KEYS: Decrypt encrypted SAML assertions
        decryptionPvk: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_KEY!,
        decryptionCert: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_CERT!,
      },

      /**
       * SESSION CONFIGURATION
       * Controls how user sessions are stored and managed.
       */
      session: {
        // Secret key for encrypting session cookies (min 32 chars)
        secret: process.env.WEBLOGIN_AUTH_SESSION_SECRET!,
        cookie: {
          // Only send cookie over HTTPS (always true in production)
          secure: true,
        },
      },

      // Enable detailed logging for debugging
      verbose: true,
    });
  }
  return _auth;
}

/**
 * AUTH PROXY EXPORT
 *
 * This Proxy allows using `auth.getSession()`, `auth.login()`, etc.
 * while maintaining lazy initialization. All property accesses are
 * delegated to the lazily-initialized instance.
 *
 * USAGE:
 * ```typescript
 * import { auth } from '@/lib/auth';
 * const session = await auth.getSession();
 * const loginResponse = auth.login({ returnTo: '/dashboard' });
 * ```
 */
export const auth = new Proxy({} as ReturnType<typeof createWebLoginNext>, {
  get(_target, prop) {
    return getAuth()[prop as keyof ReturnType<typeof createWebLoginNext>];
  },
});
