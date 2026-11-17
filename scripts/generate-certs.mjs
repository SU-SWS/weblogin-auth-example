import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const certsDir = path.join(process.cwd(), 'certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// SAML SP certificates are trusted by being pinned in the IdP's metadata, not
// through a CA chain, so a long lifetime avoids frequent re-registration.
const CERT_VALIDITY_DAYS = 3650; // 10 years

console.log(`Generating self-signed certificate (valid ${CERT_VALIDITY_DAYS} days)...`);
try {
  // Generate key and cert
  // -nodes: Don't encrypt the private key
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout certificates/sp-key.pem -out certificates/sp-cert.pem -days ${CERT_VALIDITY_DAYS} -nodes -subj "/CN=localhost"`,
    { stdio: 'inherit', cwd: process.cwd() }
  );
} catch {
  console.error('Failed to generate certificates. Make sure openssl is installed and in your PATH.');
  process.exit(1);
}

const key = fs.readFileSync(path.join(certsDir, 'sp-key.pem'), 'utf8');
// We use the same key for signing and decryption for simplicity
const cert = fs.readFileSync(path.join(certsDir, 'sp-cert.pem'), 'utf8');

const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check if keys already exist
if (envContent.includes('WEBLOGIN_AUTH_SAML_PRIVATE_KEY')) {
  console.log('Warning: WEBLOGIN_AUTH_SAML_PRIVATE_KEY already exists in .env.local. Skipping update.');
  console.log('New keys are available in ./certificates/');
  process.exit(0);
}

// Append to .env.local
// We use JSON.stringify to safely escape the string for the .env file if needed,
// but standard .env supports multiline strings if quoted.
// However, to be safe and avoid issues with some parsers, we can just dump it as a quoted string.
// Note: JSON.stringify adds double quotes around the string.

const newEnvVars = `
# SAML Signing and Decryption Keys (Generated)
WEBLOGIN_AUTH_SAML_PRIVATE_KEY="${key.trim()}"
WEBLOGIN_AUTH_SAML_DECRYPTION_KEY="${key.trim()}"
WEBLOGIN_AUTH_SAML_CERT="${cert.trim()}"
WEBLOGIN_AUTH_SAML_DECRYPTION_CERT="${cert.trim()}"
`;

fs.appendFileSync(envPath, newEnvVars);

console.log('Successfully generated certificates and updated .env.local');
console.log('Certificates are stored in ./certificates/');
