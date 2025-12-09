/**
 * =============================================================================
 * HEADER COMPONENT - app/components/Header.tsx
 * =============================================================================
 *
 * The main navigation header that displays on all pages. This component:
 * - Shows the site branding with link to home
 * - Displays login/logout buttons based on auth state
 * - Shows the current user's name when logged in
 * - Provides accessibility features (skip link, proper nav landmarks)
 *
 * KEY CONCEPTS:
 *
 * 1. SERVER COMPONENT
 *    This is an async server component that reads the session directly.
 *    No 'use client' directive = runs on the server.
 *
 * 2. READING AUTH STATE
 *    We call auth.getSession() to check if user is logged in.
 *    This reads and decrypts the session cookie automatically.
 *
 * 3. HARD NAVIGATION FOR LOGOUT
 *    The logout button uses a regular <a> tag instead of Next.js <Link>.
 *    This triggers a full page reload after logout, ensuring:
 *    - The header re-renders with fresh auth state
 *    - No stale "Welcome, User" message appears
 *    - Client-side cache is cleared
 *
 * 4. ACCESSIBILITY (a11y) FEATURES
 *    - Skip link: Keyboard users can skip to main content
 *    - aria-label: Screen reader descriptions for icons/links
 *    - nav landmark: Proper navigation structure for assistive tech
 *    - Focus indicators: Visible rings on keyboard focus
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/ for ARIA patterns
 * =============================================================================
 */

import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Header() {
  // Get the current user's session (null if not logged in)
  // This runs on the server - no client-side JS needed
  const session = await auth.getSession();

  return (
    <>
      {/*
        SKIP LINK - Accessibility feature for keyboard users
        Normally invisible (sr-only), becomes visible when focused.
        Allows keyboard users to skip repetitive navigation and jump
        straight to the main content area.
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-700">
        {/* Site branding - links to home page */}
        <Link
          href="/"
          className="text-2xl font-bold hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
          aria-label="Weblogin Auth SDK - Home"
        >
          Weblogin Auth SDK
        </Link>

        {/* Main navigation with proper landmark for screen readers */}
        <nav aria-label="Main navigation">
          <div className="flex items-center gap-4">
            {/* GitHub link - opens in new tab */}
            <a
              href="https://github.com/SU-SWS/weblogin-auth-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="View on GitHub (opens in new tab)"
            >
              {/* GitHub logo SVG - hidden from screen readers with aria-hidden */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/*
              CONDITIONAL AUTH UI
              Show different content based on whether user is logged in
            */}
            {session ? (
              <>
                {/* Welcome message showing user's display name */}
                <span className="text-gray-300">Welcome, {String(session.user?.name || session.user?.userName || '')}</span>

                {/*
                  LOGOUT BUTTON - Uses <a> tag, NOT Next.js <Link>
                  This is intentional! Using a regular anchor triggers a
                  "hard navigation" (full page reload), which ensures:
                  1. The header re-renders with the new (logged out) state
                  2. No client-side cache of the old auth state
                  3. Clean state after logout

                  If we used <Link>, the page would update via client-side
                  navigation, and the header might still show "Welcome, User"
                  until the next full page reload.
                */}
                <a
                  href="/api/auth/logout"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Logout
                </a>
              </>
            ) : (
              /* Login button - also uses <a> for full navigation through SAML flow */
              <a
                href="/api/auth/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Login
              </a>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
