# Weblogin Auth SDK Example

A comprehensive example application demonstrating the [Weblogin Auth SDK](https://github.com/SU-SWS/weblogin-auth-sdk) for Stanford University's SAML-based authentication system. Built with Next.js 16 and TypeScript.

## Features

This example demonstrates:

- **🔐 SAML Authentication** - Complete login/logout flow with Stanford's WebLogin IdP
- **🛡️ Route Protection** - Middleware-based protection for authenticated routes
- **📋 Session Management** - View and update session data with custom attributes
- **🔒 CSRF Protection** - Built-in utilities for form security
- **🔑 Protected API Routes** - Secure API endpoints that require authentication
- **📄 SAML Metadata** - Auto-generated Service Provider metadata

## Pages

| Page | Description |
|------|-------------|
| `/` | Home page with feature overview |
| `/guide` | Step-by-step implementation guide, with code read from this repo |
| `/protected` | Protected page demonstrating route protection with code examples |
| `/session` | Session inspector with ability to add custom attributes |
| `/csrf-demo` | Interactive CSRF protection demonstration |
| `/skip-validation` | How one SPDB registration serves localhost, previews and production |
| `/api/auth/login` | Initiates SAML login flow |
| `/api/auth/logout` | Terminates session and logs out |
| `/api/auth/callback` | Handles SAML assertion response |
| `/api/auth/metadata` | Service Provider metadata XML |
| `/api/protected` | Example protected API endpoint |

## Getting Started

### Prerequisites

- Node.js 22.13+, required by `weblogin-auth-sdk` 4 (this repo uses Node 24, see `.nvmrc`)
- A registered SAML Service Provider in [SPDB](https://spdb.stanford.edu)
- A signing key pair (required) and an encryption key pair (optional). `npm run certs` generates one pair used for both.

### Installation

For step-by-step instructions on integrating the Weblogin Auth SDK into your own Next.js application, see the **[Implementation Guide](https://weblogin-auth-example.netlify.app/guide)** (also at `/guide` when running locally, with a checklist in [installation.md](installation.md)).

To run this example locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/SU-SWS/weblogin-auth-example.git
   cd weblogin-auth-example
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your configuration:
   ```env
   # SAML Configuration
   WEBLOGIN_AUTH_SAML_ENTITY=https://your-app.stanford.edu
   WEBLOGIN_AUTH_SAML_RETURN_ORIGIN=https://your-app.stanford.edu
   
   # Session Configuration
   WEBLOGIN_AUTH_SESSION_SECRET=your-secret-key-min-32-chars
   
   # Signing Keys (required)
   WEBLOGIN_AUTH_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   WEBLOGIN_AUTH_SAML_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
   
   # Encryption Keys (optional, set both or neither)
   WEBLOGIN_AUTH_SAML_DECRYPTION_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   WEBLOGIN_AUTH_SAML_DECRYPTION_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
   ```

4. Generate certificates (if needed):
   ```bash
   npm run certs
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [https://localhost:3000](https://localhost:3000) in your browser. The dev server runs over HTTPS because SAML requires it.

## Registering and Renewing in SPDB

Generate metadata for SPDB from the app's real SAML config and your current keys:

```bash
npm run metadata -- --origin https://your-app.stanford.edu
```

- Writes `sp-metadata.xml` and prints the Entity ID, ACS URL, `validUntil` and certificate expiry dates.
- Refuses localhost origins, and refuses to write metadata whose signature doesn't verify.
- Run it again before `validUntil` (one year out) and upload the new file to SPDB. SPDB disables the SP configuration once `validUntil` passes.

### Certificate checks

`npm run check-certs` (also run automatically before every `npm run build`) warns when a SAML certificate expires within 60 days or has expired, and when a private key doesn't match its certificate. It only warns and never fails the build, so check your build logs for `⚠` lines.

> Signed metadata needs `weblogin-auth-sdk` 4.1.1 or later ([SU-SWS/weblogin-auth-sdk#104](https://github.com/SU-SWS/weblogin-auth-sdk/pull/104)). On older versions the script stops with an explanation instead of writing a broken file.

## Project Structure

```
├── app/
│   ├── api/auth/          # Auth API routes (login, logout, callback, metadata)
│   ├── api/protected/     # Example protected API
│   ├── components/        # Shared components (Header, CodeBlock)
│   ├── csrf-demo/         # CSRF protection demo page
│   ├── protected/         # Protected page with code examples
│   ├── session/           # Session management page
│   ├── layout.tsx         # Root layout with Header
│   ├── page.tsx           # Home page
│   └── not-found.tsx      # Custom 404 page
├── lib/
│   ├── auth.ts            # Auth SDK configuration
│   └── saml-config.ts     # SAML settings, shared with npm run metadata
├── scripts/               # npm run certs, npm run metadata
├── proxy.ts               # Middleware for route protection
└── certificates/          # Generated SSL certificates
```

## Key Concepts

### Route Protection

Routes are protected at two levels for defense in depth:

1. **Middleware (proxy.ts)** - Intercepts requests and redirects unauthenticated users
2. **Page-level checks** - Secondary validation as a fallback

### Session Management

The SDK provides methods to:
- `auth.getSession()` - Retrieve the current session
- `auth.updateSession()` - Add custom attributes to the session
- `auth.logout()` - Clear the session

### CSRF Protection

Use the built-in utilities:
```typescript
import { AuthUtils } from 'weblogin-auth-sdk';

// Generate token
const token = AuthUtils.generateCSRFToken();

// Validate token (constant-time comparison)
const isValid = AuthUtils.validateCSRFToken(submitted, expected);
```

## Related Resources

- [Implementation Guide](https://weblogin-auth-example.netlify.app/guide) - Step-by-step SDK integration instructions ([checklist](installation.md))
- [Weblogin Auth SDK Documentation](https://github.com/SU-SWS/weblogin-auth-sdk)
- [Stanford WebLogin](https://uit.stanford.edu/service/webauth)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
