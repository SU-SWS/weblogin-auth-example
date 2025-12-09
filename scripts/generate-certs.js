const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(process.cwd(), 'certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

console.log('Generating self-signed certificate...');
try {
  // Generate key and cert
  // -nodes: Don't encrypt the private key
  execSync(
    'openssl req -x509 -newkey rsa:2048 -keyout certificates/sp-key.pem -out certificates/sp-cert.pem -days 365 -nodes -subj "/CN=localhost"',
    { stdio: 'inherit', cwd: process.cwd() }
  );
} catch (e) {
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
