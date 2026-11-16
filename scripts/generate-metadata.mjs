/**
 * =============================================================================
 * GENERATE SPDB METADATA - npm run metadata
 * =============================================================================
 *
 * Builds Service Provider metadata from the app's real SAML config
 * (lib/saml-config.ts) for a given origin, checks it, and writes it to a file
 * ready to upload to SPDB. Use it for first registration, the yearly
 * validUntil renewal, and certificate rotations.
 *
 * USAGE:
 *   npm run metadata -- --origin https://your-app.stanford.edu
 *   npm run metadata -- --origin https://your-app.stanford.edu --out metadata.xml
 *
 * Keys and the Entity ID come from your environment (.env.local, then .env),
 * so generate metadata with the keys the site will actually run with.
 *
 * CHECKS:
 * - Refuses localhost origins (that ACS URL would send production logins to
 *   localhost) unless --allow-localhost is passed.
 * - Verifies the metadata signature when signMetadata is on, and refuses to
 *   write metadata whose signature doesn't verify.
 * =============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { X509Certificate } from 'node:crypto';
import { parseArgs } from 'node:util';
import dotenv from 'dotenv';
import { AuthUtils, SAMLProvider, SilentLogger } from 'weblogin-auth-sdk';
import { SignedXml } from 'xml-crypto';

const USAGE = `Usage: npm run metadata -- --origin <https://your-app.stanford.edu> [--out <file>] [--allow-localhost]`;

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const { values: args } = parseArgs({
  options: {
    origin: { type: 'string' },
    out: { type: 'string', default: 'sp-metadata.xml' },
    'allow-localhost': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(USAGE);
  process.exit(0);
}

// Same precedence as Next.js: .env.local overrides .env
dotenv.config({ path: ['.env.local', '.env'], quiet: true });

// ---------------------------------------------------------------------------
// Origin: where the IdP will post SAML responses (the ACS URL's origin)
// ---------------------------------------------------------------------------
const rawOrigin = args.origin ?? process.env.URL;
if (!rawOrigin) {
  const hint = process.env.WEBLOGIN_AUTH_SAML_ENTITY
    ? `\n  Your Entity ID is ${process.env.WEBLOGIN_AUTH_SAML_ENTITY}, which is usually the production URL.`
    : '';
  fail(`Pass --origin with your production URL.${hint}\n  ${USAGE}`);
}

let origin;
try {
  origin = new URL(rawOrigin);
} catch {
  fail(`--origin is not a valid URL: ${rawOrigin}`);
}
if (origin.protocol !== 'https:') {
  fail(`--origin must use https (SAML requires it): ${origin.origin}`);
}
if (['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname) && !args['allow-localhost']) {
  fail(
    `--origin is ${origin.origin}. Metadata registered in SPDB with a localhost ACS URL sends ` +
      `production logins to localhost. Use your production URL, or pass --allow-localhost if you really mean it.`
  );
}

// lib/saml-config.ts reads the origin from URL (as on Netlify)
process.env.URL = origin.origin;

// ---------------------------------------------------------------------------
// Generate metadata from the app's own SAML config
// ---------------------------------------------------------------------------
const { getSamlConfig } = await import(new URL('../lib/saml-config.ts', import.meta.url).href);
const samlConfig = getSamlConfig();

let metadata;
try {
  metadata = new SAMLProvider(samlConfig, new SilentLogger()).getMetadata();
} catch (error) {
  fail(`Could not generate metadata: ${error.message}\n  Check your WEBLOGIN_AUTH_SAML_* environment variables.`);
}

// ---------------------------------------------------------------------------
// Verify the signature
// ---------------------------------------------------------------------------
let signatureStatus = 'not signed (signMetadata is off)';
if (samlConfig.signMetadata) {
  const signature = metadata.match(/<Signature\b[\s\S]*?<\/Signature>/)?.[0];
  if (!signature) fail('signMetadata is on, but the generated metadata has no signature.');

  let valid = false;
  try {
    const verifier = new SignedXml({ publicCert: AuthUtils.formatCertificate(samlConfig.cert) });
    verifier.loadSignature(signature);
    valid = verifier.checkSignature(metadata);
  } catch {
    valid = false;
  }

  if (!valid) {
    fail(
      'The metadata signature does not verify against WEBLOGIN_AUTH_SAML_CERT, so nothing was written.\n' +
        '  weblogin-auth-sdk 4.1.0 and earlier add validUntil after signing, which invalidates the signature\n' +
        '  (fixed by https://github.com/SU-SWS/weblogin-auth-sdk/pull/104). Upgrade to the first release with the fix.\n' +
        '  If you are already on a fixed version, check that WEBLOGIN_AUTH_SAML_CERT matches WEBLOGIN_AUTH_SAML_PRIVATE_KEY.'
    );
  }
  signatureStatus = 'valid';
}

// ---------------------------------------------------------------------------
// Summarize, then write
// ---------------------------------------------------------------------------
const attr = (pattern) => metadata.match(pattern)?.[1] ?? '(missing)';
const validUntil = new Date(attr(/validUntil="([^"]+)"/));
const formatDate = (date) => date.toISOString().slice(0, 10);

const certs = [...metadata.matchAll(/<KeyDescriptor use="(\w+)">[\s\S]*?<ds:X509Certificate>([^<]+)</g)].map(
  ([, use, b64]) => {
    const cert = new X509Certificate(Buffer.from(b64.replace(/\s+/g, ''), 'base64'));
    return { use, expires: new Date(cert.validTo), fingerprint: cert.fingerprint256 };
  }
);

console.log('\nSP metadata');
console.log(`  Entity ID    ${attr(/entityID="([^"]+)"/)}`);
console.log(`  ACS URL      ${attr(/<AssertionConsumerService[^>]*Location="([^"]+)"/)}`);
console.log(`  validUntil   ${formatDate(validUntil)}  (renew in SPDB before this date)`);
console.log(`  Signature    ${signatureStatus}`);
for (const { use, expires, fingerprint } of certs) {
  console.log(`  ${use.padEnd(12)} cert expires ${formatDate(expires)}, SHA-256 ${fingerprint}`);
}
if (!certs.some((c) => c.use === 'encryption')) {
  console.log('  encryption   none (the IdP will send signed, unencrypted assertions)');
}

for (const { use, expires } of certs) {
  if (expires < validUntil) {
    console.warn(`\n⚠ The ${use} certificate expires before validUntil. Consider rotating it now (npm run certs).`);
  }
}

const outPath = path.resolve(process.cwd(), args.out);
fs.writeFileSync(outPath, metadata);
console.log(`\n✔ Wrote ${outPath}`);
console.log('  Upload it to your SP configuration at https://spdb.stanford.edu\n');
