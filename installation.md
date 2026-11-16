# Weblogin Auth SDK Installation Guide (Next.js)

Step-by-step instructions for adding Stanford WebLogin (SAML) to a Next.js App Router application with `weblogin-auth-sdk`, registering it in SPDB, and keeping it running.

Code samples are simplified from working files in this repository, linked after each step. When in doubt, those files are the reference.

## Prerequisites

- A Next.js 16 application using the App Router
- Node.js 20.9 or later (this repo uses Node 24, see `.nvmrc`)
- Access to register a Service Provider (SP) in [SPDB](https://spdb.stanford.edu)
- `openssl` for generating certificates

## Step 1: Install the SDK

```bash
npm install weblogin-auth-sdk@^3
```

## Step 2: Choose your Entity ID and origins

- **Entity ID:** a unique identifier for your SP, conventionally your production URL (for example `https://your-app.stanford.edu`). It's registered in SPDB and must never change.
- **Return origin:** the base URL the IdP posts the SAML response back to. In production this is your site URL. Locally it's `https://localhost:3000`.

Local development and deploy previews can share the production Entity ID. The SDK signs each AuthnRequest and leaves out the ACS URL (`skipRequestAcsUrl: true`), so Stanford's IdP sends the response back to whatever origin made the request. See [Skip Endpoint Validation](https://uit.stanford.edu/service/saml/skipendpointvalidation).

## Step 3: Generate certificates

| Key pair | Required? | Used for |
|---|---|---|
| Signing (`privateKey`, `cert`) | **Required** | Signing AuthnRequests and metadata |
| Encryption (`decryptionPvk`, `decryptionCert`) | Optional (see note) | Letting the IdP encrypt assertions to you |

> **Note:** `weblogin-auth-sdk` 3.0.5 and earlier require the encryption pair as well. It becomes optional once [SU-SWS/weblogin-auth-sdk#106](https://github.com/SU-SWS/weblogin-auth-sdk/pull/106) is released. If you use encryption, always set both the key and the certificate.

Generate a self-signed certificate valid for 10 years:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -keyout sp-key.pem -out sp-cert.pem \
  -subj "/CN=your-app.stanford.edu"
```

- SP certificates are trusted because they're pinned in your SPDB metadata, not through a certificate authority. A long lifetime avoids frequent rotations.
- You can use the same key pair for signing and encryption, as this repo does, or generate a second pair for encryption.
- Never commit the `.pem` files. Store them in your secrets manager (this repo uses Vault).

## Step 4: Configure environment variables

Create `.env.local`:

```bash
# Your SP Entity ID, as registered in SPDB
WEBLOGIN_AUTH_SAML_ENTITY="https://your-app.stanford.edu"

# Where the IdP sends users back to. Use https://localhost:3000 for local dev.
WEBLOGIN_AUTH_SAML_RETURN_ORIGIN="https://localhost:3000"

# At least 32 random characters, for example: openssl rand -base64 48
WEBLOGIN_AUTH_SESSION_SECRET="..."

# Signing key pair (required)
WEBLOGIN_AUTH_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
WEBLOGIN_AUTH_SAML_CERT="-----BEGIN CERTIFICATE-----..."

# Encryption key pair (optional, set both or neither)
WEBLOGIN_AUTH_SAML_DECRYPTION_KEY="-----BEGIN PRIVATE KEY-----..."
WEBLOGIN_AUTH_SAML_DECRYPTION_CERT="-----BEGIN CERTIFICATE-----..."
```

> **Always pass `idpCert` explicitly in your config (Step 5).** If `idpCert` is missing, the SDK falls back to the `WEBLOGIN_AUTH_SAML_CERT` env var for the *IdP* certificate. With the names above, that variable holds *your SP* certificate, so every SAML response would fail validation.

## Step 5: Initialize the SDK

Create `lib/auth.ts`. Create the instance lazily, on first use: Netlify bundles edge functions before environment variables are available, and an instance created at import time fails config validation during the build.

```typescript
import { createWebLoginNext } from 'weblogin-auth-sdk/next';
import { idps } from 'weblogin-auth-sdk';

let _auth: ReturnType<typeof createWebLoginNext> | null = null;

export function getAuth() {
  if (!_auth) {
    _auth = createWebLoginNext({
      saml: {
        issuer: process.env.WEBLOGIN_AUTH_SAML_ENTITY!,

        // Stanford production IdP (use idps.uat for UAT)
        entryPoint: idps.prod.entryPoint,
        idpCert: idps.prod.cert,

        // On Netlify, URL is the site's primary URL
        returnToOrigin: process.env.URL || process.env.WEBLOGIN_AUTH_SAML_RETURN_ORIGIN!,
        returnToPath: '/api/auth/callback',

        // Signing (required)
        privateKey: process.env.WEBLOGIN_AUTH_SAML_PRIVATE_KEY!,
        cert: process.env.WEBLOGIN_AUTH_SAML_CERT!,
        signMetadata: true,

        // Leave the ACS URL out of AuthnRequests so local dev and deploy
        // previews work with one SPDB registration (see Step 2)
        skipRequestAcsUrl: true,

        // Encryption (optional, remove both lines to disable)
        decryptionPvk: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_KEY,
        decryptionCert: process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_CERT,
      },
      session: {
        secret: process.env.WEBLOGIN_AUTH_SESSION_SECRET!,
        cookie: { secure: true },
      },
    });
  }
  return _auth;
}

// Lets you write auth.getSession() etc. while keeping lazy initialization
export const auth = new Proxy({} as ReturnType<typeof createWebLoginNext>, {
  get(_target, prop) {
    return getAuth()[prop as keyof ReturnType<typeof createWebLoginNext>];
  },
});
```

Reference: [lib/auth.ts](lib/auth.ts)

## Step 6: Create the auth routes

**`app/api/auth/login/route.ts`**

```typescript
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/';

  // Pass the request's origin so the IdP returns users to this deployment
  // (localhost, a deploy preview, or production)
  const origin = new URL(request.url).origin;

  return auth.login({ returnTo, origin });
}
```

**`app/api/auth/callback/route.ts`** (your ACS endpoint)

```typescript
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const { returnTo } = await auth.authenticate(request);
  return Response.redirect(new URL(returnTo || '/', request.url));
}
```

**`app/api/auth/logout/route.ts`**

```typescript
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  await auth.logout();
  return Response.redirect(new URL('/', request.url));
}
```

**`app/api/auth/metadata/route.ts`**

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return new NextResponse(auth.getMetadata(), {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 });
  }
}
```

References: [login](app/api/auth/login/route.ts), [callback](app/api/auth/callback/route.ts), [logout](app/api/auth/logout/route.ts), [metadata](app/api/auth/metadata/route.ts)

## Step 7: Protect routes

Next.js runs `proxy.ts` on the edge (a Netlify Edge Function in production), where the Node-based `auth` instance isn't available. Use the SDK's edge session reader there.

**`proxy.ts`**

```typescript
import { createEdgeSessionReader } from 'weblogin-auth-sdk/edge-session';
import { NextRequest, NextResponse } from 'next/server';

const sessionReader = createEdgeSessionReader(
  process.env.WEBLOGIN_AUTH_SESSION_SECRET!,
  'weblogin-auth' // cookie name, the SDK default
);

export async function proxy(request: NextRequest) {
  let isAuthenticated = false;
  try {
    isAuthenticated = await sessionReader.isAuthenticated(request);
  } catch (err) {
    console.error('Session check failed', err);
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/api/auth/login', request.url);
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};
```

In server components, route handlers and server actions, use the full SDK:

```typescript
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth.getSession();
  if (!session) return <p>Not logged in</p>;
  return <p>Hello, {session.user.name}</p>;
}
```

Check the session again in protected pages and API routes, as [app/protected/page.tsx](app/protected/page.tsx) and [app/api/protected/route.ts](app/api/protected/route.ts) do, rather than relying on the proxy alone.

References: [proxy.ts](proxy.ts)

## Step 8: Run locally over HTTPS

SAML requires HTTPS.

1. Use Next.js's built-in HTTPS in `package.json`:
   ```json
   "scripts": {
     "dev": "next dev --experimental-https"
   }
   ```
2. Set `WEBLOGIN_AUTH_SAML_RETURN_ORIGIN="https://localhost:3000"`.
3. Run `npm run dev` and open https://localhost:3000.

## Step 9: Register in SPDB

1. Generate metadata **for your production URL**. Don't download it from localhost: the ACS URL inside it would point at `https://localhost:3000` and production logins would go there.
   - Deploy the site, then download `https://your-app.stanford.edu/api/auth/metadata`.
   - Or generate it offline: copy [scripts/generate-metadata.mjs](scripts/generate-metadata.mjs) and [lib/saml-config.ts](lib/saml-config.ts) from this repo, then run `npm run metadata -- --origin https://your-app.stanford.edu`. It refuses localhost origins and checks the signature before writing.
   - **Known issue:** with `signMetadata: true`, `weblogin-auth-sdk` 3.0.5 and earlier produce metadata whose signature is invalid. Fixed by [SU-SWS/weblogin-auth-sdk#104](https://github.com/SU-SWS/weblogin-auth-sdk/pull/104). Upgrade once it's released before submitting signed metadata.
2. Create a new SP configuration in [SPDB](https://spdb.stanford.edu), using your Entity ID and the metadata file.
3. Request the attributes your app needs (for example `uid`, `displayName`, `mail`, `eduPersonAffiliation`).
4. Wait for the IdP to pick up the configuration before testing.

## Step 10: Keep it running

### Renew metadata every year

Generated metadata includes a `validUntil` date one year out. **When it passes, SPDB disables your SP configuration and logins stop working.**

- Put a reminder in your calendar a few weeks before the date in your submitted metadata.
- To renew: regenerate metadata (Step 9) and update it on your SP configuration in SPDB.

### Rotate certificates

Your SPDB metadata pins your certificates. Changing the key pair in your app without updating SPDB (or the other way round) breaks logins, so plan the cutover:

1. Generate the new key pair (Step 3).
2. Generate metadata containing the new certificates.
3. Update the metadata in SPDB, then immediately deploy the new keys to your app.

Logins fail between the SPDB update and the deploy finishing, because the IdP verifies against and encrypts to the new certificate while the app still has the old key. Keep that gap short.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Missing required SAML configuration: ...` at startup | An env var is unset, or not available yet at build time. Check Step 4 and the lazy initialization in Step 5. |
| Every login fails signature validation | `idpCert` isn't set, so the SDK used `WEBLOGIN_AUTH_SAML_CERT` (your SP cert) as the IdP cert. See the note in Step 4. |
| Production login sends users to localhost | The SPDB metadata was generated on localhost. Regenerate it from the production URL (Step 9). |
| Logins stopped after about a year | Metadata `validUntil` passed and SPDB disabled the SP. Renew it (Step 10). |
| Logins fail right after a key change | The SPDB metadata and the app's keys don't match. Finish the rotation (Step 10). |
