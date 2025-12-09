import { createWebLoginNext } from 'weblogin-auth-sdk/next';
import { idps } from 'weblogin-auth-sdk';

// Lazy initialization to avoid config validation during edge function bundling
let _auth: ReturnType<typeof createWebLoginNext> | null = null;

export function getAuth() {
  if (!_auth) {
    _auth = createWebLoginNext({
      saml: {
        issuer: process.env.WEBLOGIN_AUTH_SAML_ENTITY!,
        // Use the production IdP preset
        entryPoint: idps.prod.entryPoint,
        idpCert: idps.prod.cert,
        returnToOrigin: process.env.WEBLOGIN_AUTH_SAML_RETURN_ORIGIN!,
        // Optional: Signing keys
        privateKey: process.env.WEBLOGIN_AUTH_SAML_PRIVATE_KEY!,
        cert: process.env.WEBLOGIN_AUTH_SAML_CERT!,
        // signMetadata: true,
        skipRequestAcsUrl: true,
        // Optional: Decryption keys
        decryptionPvk: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_KEY!,
        decryptionCert: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_CERT!,
      },
      session: {
        secret: process.env.WEBLOGIN_AUTH_SESSION_SECRET!,
        cookie: {
          secure: true,
        },
      },
      verbose: true,
    });
  }
  return _auth;
}

// For backwards compatibility - creates auth on first access
export const auth = new Proxy({} as ReturnType<typeof createWebLoginNext>, {
  get(_target, prop) {
    return getAuth()[prop as keyof ReturnType<typeof createWebLoginNext>];
  },
});
