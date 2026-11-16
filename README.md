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
| `/protected` | Protected page demonstrating route protection with code examples |
| `/session` | Session inspector with ability to add custom attributes |
| `/csrf-demo` | Interactive CSRF protection demonstration |
| `/api/auth/login` | Initiates SAML login flow |
| `/api/auth/logout` | Terminates session and logs out |
| `/api/auth/callback` | Handles SAML assertion response |
| `/api/auth/metadata` | Service Provider metadata XML |
| `/api/protected` | Example protected API endpoint |

## Getting Started

### Prerequisites

- Node.js 18+ 
- A registered SAML Service Provider with Stanford's IdP
- SSL certificates for signed SAML requests (optional but recommended)

### Installation

For detailed step-by-step instructions on integrating the Weblogin Auth SDK into your own Next.js application, see the **[Installation Guide](installation.md)**.

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
   
   # Optional: Signing Keys
   WEBLOGIN_AUTH_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   WEBLOGIN_AUTH_SAML_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
   
   # Optional: Decryption Keys
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

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
│   └── auth.ts            # Auth SDK configuration
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

- [Installation Guide](installation.md) - Step-by-step SDK integration instructions
- [Weblogin Auth SDK Documentation](https://github.com/SU-SWS/weblogin-auth-sdk)
- [Stanford WebLogin](https://uit.stanford.edu/service/webauth)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
