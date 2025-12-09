/**
 * =============================================================================
 * PROTECTED PAGE - app/protected/page.tsx
 * =============================================================================
 *
 * A demonstration of route protection using middleware (proxy.ts).
 * This page can only be accessed by authenticated users.
 *
 * PROTECTION LAYERS:
 * This page is protected at TWO levels for defense-in-depth:
 *
 * 1. MIDDLEWARE (proxy.ts)
 *    - Intercepts requests BEFORE they reach this page
 *    - Redirects unauthenticated users to login
 *    - Users never see this page without authentication
 *
 * 2. PAGE-LEVEL CHECK (this file)
 *    - Secondary check as a fallback
 *    - Handles edge cases where middleware might be bypassed
 *    - Shows "Access Denied" if session is missing
 *
 * WHY BOTH?
 * Defense-in-depth is a security best practice. If middleware fails or is
 * misconfigured, the page-level check provides a safety net. It's also
 * useful during development when middleware might not be running.
 *
 * CONTENT:
 * - Shows authenticated user's session information
 * - Displays code examples showing how protection works
 * - Explains the security architecture
 * =============================================================================
 */

import { auth } from '@/lib/auth';
import { type Session } from 'weblogin-auth-sdk';
import CodeBlock from '@/app/components/CodeBlock';
import BackToHome from '@/app/components/BackToHome';

// Code examples shown on the page (defined as constants for clarity)
const proxyCode = `import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  // Protect /protected routes
  if (request.nextUrl.pathname.startsWith('/protected')) {
    const session = await auth.getSession(request);
    if (!session) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};`;

const pageCode = `import { auth } from '@/lib/auth';
import { type Session } from 'weblogin-auth-sdk';

export default async function ProtectedPage() {
  const session: Session | null = await auth.getSession();

  if (!session || !session.user || !session.user.name) {
    // Access denied - fallback if middleware is bypassed
    return <AccessDenied />;
  }

  // User is authenticated, render protected content
  return <ProtectedContent session={session} />;
}`;

const authConfigCode = `import { createWebLoginNext } from 'weblogin-auth-sdk/next';
import { idps } from 'weblogin-auth-sdk';

export const auth = createWebLoginNext({
  saml: {
    issuer: process.env.WEBLOGIN_AUTH_SAML_ENTITY!,
    entryPoint: idps.prod.entryPoint,
    idpCert: idps.prod.cert,
    returnToOrigin: process.env.WEBLOGIN_AUTH_SAML_RETURN_ORIGIN!,
    // ... additional configuration
  },
  session: {
    name: 'weblogin-auth',
    secret: process.env.WEBLOGIN_AUTH_SESSION_SECRET!,
    cookie: { secure: true },
  },
});`;

export default async function ProtectedPage() {
  // Get the session - middleware already verified auth, but we double-check
  const session: Session | null = await auth.getSession();

  if (!session || !session.user || !session.user.name) {
    // Access denied, return 403, but this should be handled by middleware by this point.
    return (
      <main id="main-content" className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-300 mb-6">You must be logged in to view this page.</p>
        <a
          href="/api/auth/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Login
        </a>
      </main>
    );
  }

  const userName = String(session.user?.name || session.user?.userName || '');

  return (
    <main id="main-content">
      <BackToHome />
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {userName}!</h1>
        <p className="text-gray-300 mt-2">You have successfully accessed the protected page.</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Session Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-300">Name</span>
            <span className="font-medium">{session.user?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-300">UID</span>
            <span className="font-medium">{String(session.user?.uid || 'N/A')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-300">Email</span>
            <span className="font-medium">{session.user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-300">Affiliation</span>
            <span className="font-medium">{String(session.user?.eduPersonAffiliation || 'N/A')}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-300">Session Active</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Code Examples Section */}
      <section aria-label="Code Examples">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <p className="text-gray-300 mb-6">
          This page is protected using a combination of middleware-level route protection and page-level session validation.
          Here&apos;s the code that makes it work:
        </p>

        <div className="space-y-8">
          {/* Proxy/Middleware Code */}
          <article>
            <div className="mb-3">
              <h3 className="font-semibold text-yellow-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                1. Middleware Protection
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Intercepts requests to /protected routes and redirects unauthenticated users to login.
              </p>
            </div>
            <CodeBlock code={proxyCode} filename="proxy.ts" />
          </article>

          {/* Auth Configuration */}
          <article>
            <div className="mb-3">
              <h3 className="font-semibold text-green-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                2. Auth Configuration
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Creates the auth instance with SAML and session configuration.
              </p>
            </div>
            <CodeBlock code={authConfigCode} filename="lib/auth.ts" />
          </article>

          {/* Page-Level Check */}
          <article>
            <div className="mb-3">
              <h3 className="font-semibold text-purple-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                3. Page-Level Validation
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Secondary check in the page component as a fallback defense layer.
              </p>
            </div>
            <CodeBlock code={pageCode} filename="app/protected/page.tsx" />
          </article>
        </div>

        {/* Key Points */}
        <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-xl p-6">
          <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Security Points
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Defense in Depth:</strong> Both middleware and page-level checks ensure protection even if one layer fails.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Return URL:</strong> The middleware preserves the original URL so users return after login.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Secure Cookies:</strong> Session cookies are configured with <code className="bg-gray-800 px-1 rounded">secure: true</code> for HTTPS-only transmission.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Encrypted Sessions:</strong> Session data is encrypted using the secret key before being stored.</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
