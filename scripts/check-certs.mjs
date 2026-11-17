/**
 * =============================================================================
 * CHECK SP CERTIFICATES - npm run check-certs (also runs before npm run build)
 * =============================================================================
 *
 * Warns when a SAML certificate is close to expiring or has expired, and when
 * a private key doesn't match its certificate (a common mistake during
 * rotation, which breaks logins).
 *
 * It only ever warns: a failing build would block the deploy you might need
 * to fix the problem. Look for these warnings in your Netlify build logs.
 *
 * Reads the same environment variables as the app (.env.local, then .env,
 * then the process environment). Pairs that aren't set are skipped.
 * =============================================================================
 */

import { X509Certificate, createPrivateKey, createPublicKey } from 'node:crypto';
import dotenv from 'dotenv';
import { AuthUtils } from 'weblogin-auth-sdk';

const WARN_WITHIN_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

dotenv.config({ path: ['.env.local', '.env'], quiet: true });

const PAIRS = [
  { label: 'signing', certVar: 'WEBLOGIN_AUTH_SAML_CERT', keyVar: 'WEBLOGIN_AUTH_SAML_PRIVATE_KEY' },
  { label: 'encryption', certVar: 'WEBLOGIN_AUTH_SAML_DECRYPTION_CERT', keyVar: 'WEBLOGIN_AUTH_SAML_DECRYPTION_KEY' },
];

const problems = [];
const lines = [];

for (const { label, certVar, keyVar } of PAIRS) {
  const certPem = process.env[certVar];
  const keyPem = process.env[keyVar];
  if (!certPem) continue;

  let cert;
  try {
    cert = new X509Certificate(AuthUtils.formatCertificate(certPem));
  } catch {
    problems.push(`${certVar} is not a valid certificate.`);
    continue;
  }

  const expires = new Date(cert.validTo);
  const daysLeft = Math.floor((expires.getTime() - Date.now()) / DAY_MS);
  const when = daysLeft < 0 ? `expired ${-daysLeft} days ago` : `in ${daysLeft} days`;
  lines.push(`  ${label.padEnd(10)} cert (${certVar}) expires ${expires.toISOString().slice(0, 10)}, ${when}`);

  if (daysLeft < 0) {
    problems.push(
      `The ${label} certificate (${certVar}) EXPIRED on ${expires.toISOString().slice(0, 10)}. Rotate it: npm run certs, then npm run metadata and update SPDB.`
    );
  } else if (daysLeft <= WARN_WITHIN_DAYS) {
    problems.push(
      `The ${label} certificate (${certVar}) expires in ${daysLeft} days. Plan a rotation: npm run certs, then npm run metadata and update SPDB.`
    );
  }

  if (keyPem) {
    try {
      const keyPublic = createPublicKey(createPrivateKey(AuthUtils.formatPrivateKey(keyPem)));
      const certPublic = cert.publicKey;
      const same = keyPublic.export({ type: 'spki', format: 'der' }).equals(certPublic.export({ type: 'spki', format: 'der' }));
      if (!same) {
        problems.push(`${keyVar} does not match ${certVar}. Logins will fail until the key and certificate are from the same pair.`);
      }
    } catch {
      problems.push(`${keyVar} is not a valid private key.`);
    }
  }
}

if (lines.length === 0 && problems.length === 0) {
  console.log('check-certs: no SAML certificates in the environment, skipping.');
} else {
  console.log('check-certs: SAML certificates');
  for (const line of lines) console.log(line);
  for (const problem of problems) console.warn(`\n⚠ ${problem}`);
  if (problems.length) console.warn('');
}
