# Weblogin Auth SDK Installation Guide (Next.js)

This guide provides step-by-step instructions for integrating the `weblogin-auth-sdk` into a Next.js application and configuring the Stanford Identity Provider (IdP).

## Prerequisites

- A Next.js application (App Router recommended)
- Node.js 18+
- Access to register a Service Provider (SP) with Stanford UIT (spdb.stanford.edu)

## Step 1: Install the SDK

Install the package using npm:

```bash
npm install weblogin-auth-sdk@^3
```

## Step 2: Configure Environment Variables

Create or update your `.env.local` file with the following variables. You will need to generate a secure random string for the session secret.

```bash
# The Entity ID for your application (e.g., https://your-app.stanford.edu)
WEBLOGIN_AUTH_SAML_ENTITY="https://localhost:3000"

# The base URL of your application
WEBLOGIN_AUTH_SAML_RETURN_ORIGIN="https://localhost:3000/api/auth/callback"

# A secure random string (min 32 chars) for encrypting session cookies
WEBLOGIN_AUTH_SESSION_SECRET="change-this-to-a-secure-random-32-char-string"
```

## Step 3: Generate Certificates (Optional but Recommended)

For production apps or to support encrypted assertions, you need a signing/decryption key pair.

1.  Generate a self-signed certificate and private key:

    ```bash
    openssl req -x509 -newkey rsa:2048 -keyout sp-key.pem -out sp-cert.pem -days 365 -nodes -subj "/CN=your-app.stanford.edu"
    ```

2.  Add the content of these files to your `.env.local`:

    ```bash
    WEBLOGIN_AUTH_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
    WEBLOGIN_AUTH_SAML_DECRYPTION_KEY="-----BEGIN PRIVATE KEY-----..."
    WEBLOGIN_AUTH_SAML_CERT="-----BEGIN CERTIFICATE-----..."
    ```

## Step 4: Initialize the SDK

Create a configuration file at `lib/auth.ts`:

```typescript
import { createWebLoginNext } from 'weblogin-auth-sdk/next';
import { idps } from 'weblogin-auth-sdk';

export const auth = createWebLoginNext({
  saml: {
    issuer: process.env.WEBLOGIN_AUTH_SAML_ENTITY!,
    // Use the production IdP preset (or idps.uat for testing)
    entryPoint: idps.prod.entryPoint,
    idpCert: idps.prod.cert,
    returnToOrigin: process.env.WEBLOGIN_AUTH_SAML_RETURN_ORIGIN!,
    
    // Optional: Signing and Decryption keys
    privateKey: process.env.WEBLOGIN_AUTH_SAML_PRIVATE_KEY,
    decryptionPvk: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_KEY,
    decryptionCert: process.env.WEBLOGIN_AUTH_SAML_CERT,

    // Optional: Skip ACS urls in metadata (must have signing cert)
    // Useful if you have multiple urls like preview builds and don't want to add them all.
    skipRequestAcsUrl: true,
  },
  session: {
    name: 'weblogin-auth-session',
    secret: process.env.WEBLOGIN_AUTH_SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
    }
  },
});
```

## Step 5: Create API Routes

Set up the authentication endpoints in your `app` directory.

**`app/api/auth/login/route.ts`**
```typescript
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/';
  return auth.login({ returnTo });
}
```

**`app/api/auth/callback/route.ts`**
```typescript
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const { returnTo } = await auth.authenticate(request);
  const redirectUrl = returnTo || '/';
  return Response.redirect(new URL(redirectUrl, request.url));
}
```

**`app/api/auth/logout/route.ts`**
```typescript
import { auth } from '@/lib/auth';

export async function POST() {
  await auth.logout();
  return Response.redirect('/');
}
```

**`app/api/auth/metadata/route.ts`** (For IdP Registration)
```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const metadata = auth.getMetadata();
    return new NextResponse(metadata, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename=metadata.xml',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 });
  }
}
```

## Step 6: Protect Routes with Middleware

Create a `proxy.ts` (formerly `middleware.ts`) file in your root or `src` directory to protect specific routes.

```typescript
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  // Protect routes starting with /protected
  if (request.nextUrl.pathname.startsWith('/protected')) {
    const session = await auth.getSession(request);
    
    if (!session) {
      // Redirect to login and return to the current page after
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};
```

## Step 7: Register with Stanford IdP

To make your application work with Stanford WebLogin, you must register your Service Provider (SP).

1.  **Download Metadata**: Start your application (`npm run dev`) and visit `https://localhost:3000/api/auth/metadata` to download your SP metadata XML file.
2.  **Visit UIT Service Page**: Go to [Stanford SAML Service](https://uit.stanford.edu/service/saml).
3.  **Submit a Request**:
    *   Click on "Submit a Help Ticket" or the appropriate link to register a new SP.
    *   Provide your **Entity ID** (from `.env.local`).
    *   Upload the **metadata.xml** file you generated.
    *   Request release of necessary attributes (e.g., `eduPersonPrincipalName`, `displayName`, `mail`).
4.  **Wait for Approval**: UIT will configure the IdP to trust your SP. This may take some time.

## Step 8: Local Development with HTTPS

SAML requires HTTPS. For local development:

1.  Update `package.json`:
    ```json
    "scripts": {
      "dev": "next dev --experimental-https"
    }
    ```
2.  Run `npm run dev`. Next.js will generate a local self-signed certificate.
3.  Ensure your `WEBLOGIN_AUTH_SAML_RETURN_ORIGIN` is set to `https://localhost:3000`.

## Usage Example

**Accessing Session in a Server Component:**

```typescript
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth.getSession();
  
  if (session) {
    return <div>Hello, {session.user.name}</div>;
  }
  return <div>Not logged in</div>;
}
```
