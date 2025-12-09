import { createWebLoginNext } from 'weblogin-auth-sdk/next';
import { idps } from 'weblogin-auth-sdk';

export const auth = createWebLoginNext({
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
});
