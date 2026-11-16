/**
 * =============================================================================
 * SAML CONFIGURATION - lib/saml-config.ts
 * =============================================================================
 *
 * The SAML Service Provider (SP) settings, kept separate from lib/auth.ts so
 * they can be used outside Next.js. scripts/generate-metadata.mjs builds SPDB
 * metadata from this same config, so the metadata you submit always matches
 * what the site runs with.
 *
 * Only import from 'weblogin-auth-sdk' here (not 'weblogin-auth-sdk/next'),
 * so this file loads in plain Node.
 *
 * Read env vars inside the function, not at module load: on Netlify, edge
 * functions are bundled before environment variables are available.
 * =============================================================================
 */

import { idps } from 'weblogin-auth-sdk';
import type { SamlConfig } from 'weblogin-auth-sdk';

export function getSamlConfig(): SamlConfig {
  return {
    // issuer: Your SP Entity ID - must match Stanford registration
    issuer: process.env.WEBLOGIN_AUTH_SAML_ENTITY!,

    // Use the SDK's built-in IdP presets (prod or uat).
    // Always set idpCert explicitly: without it the SDK falls back to the
    // WEBLOGIN_AUTH_SAML_CERT env var, which in this app holds the SP cert.
    entryPoint: idps.prod.entryPoint,
    idpCert: idps.prod.cert,

    // Base URL for callback - SDK appends returnToPath.
    // On Netlify, URL is the site's primary URL.
    returnToOrigin: process.env.URL || process.env.WEBLOGIN_AUTH_SAML_RETURN_ORIGIN!,

    // ACS URL path where SAML responses are sent
    returnToPath: '/api/auth/callback',

    // SIGNING KEYS (required): Sign outgoing SAML requests for verification
    privateKey: process.env.WEBLOGIN_AUTH_SAML_PRIVATE_KEY!,
    cert: process.env.WEBLOGIN_AUTH_SAML_CERT!,

    // Sign metadata XML (required when skipRequestAcsUrl is true)
    signMetadata: true,

    // Use current ACS URL from metadata instead of hardcoded one in IDP.
    skipRequestAcsUrl: process.env.WEBLOGIN_AUTH_SAML_SKIP_ACS_VALIDATION === 'true',

    // DECRYPTION KEYS: Decrypt encrypted SAML assertions
    decryptionPvk: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_KEY!,
    decryptionCert: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_CERT!,
  };
}
