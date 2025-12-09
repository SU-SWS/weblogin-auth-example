/**
 * =============================================================================
 * CUSTOM 404 PAGE - app/not-found.tsx
 * =============================================================================
 *
 * Next.js App Router automatically uses this component when a route is not
 * found. By creating not-found.tsx in the app directory, we override the
 * default 404 page with a custom design.
 *
 * HOW NEXT.JS 404 WORKS:
 * - Next.js automatically renders this page for unknown routes
 * - You can also trigger it manually with `notFound()` from 'next/navigation'
 * - This file in app/ catches all unmatched routes
 * - You can also create not-found.tsx in subdirectories for route-specific 404s
 *
 * ACCESSIBILITY NOTES:
 * - Uses semantic <main> element with id="main-content" for skip link targeting
 * - Proper heading hierarchy (h1 for main title)
 * - Clear, helpful error message
 * - Visible focus states on interactive elements
 * - High contrast colors for readability
 *
 * NAVIGATION OPTIONS:
 * - "Go Home" - Uses Next.js Link for client-side navigation
 * - "Login" - Uses regular <a> tag to ensure full page load for auth flow
 *
 * STYLING:
 * - Centered layout with flexbox
 * - Large 404 number for visual impact
 * - Consistent with site's dark theme
 * - Responsive design works on all screen sizes
 * =============================================================================
 */

import Link from 'next/link';

/**
 * NotFound Component
 *
 * Displayed when users navigate to a non-existent route.
 * Provides helpful navigation options to get back on track.
 */
export default function NotFound() {
  return (
    <main id="main-content" className="flex flex-col items-center justify-center py-20 text-center">
      {/* Large 404 visual indicator */}
      <div className="mb-8">
        <span className="text-9xl font-bold text-gray-700">404</span>
      </div>

      {/* Main heading - important for accessibility and SEO */}
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>

      {/* Helpful description explaining the error */}
      <p className="text-gray-300 mb-8 max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
      </p>

      {/* Navigation options */}
      <div className="flex gap-4">
        {/*
         * "Go Home" uses Next.js Link for fast client-side navigation.
         * This is preferred for internal navigation as it doesn't trigger
         * a full page reload.
         */}
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Go Home
        </Link>

        {/*
         * "Login" uses a regular <a> tag instead of Next.js Link.
         * This ensures a full page navigation, which is important for
         * auth flows that need to set cookies and establish sessions.
         */}
        <a
          href="/api/auth/login"
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Login
        </a>
      </div>
    </main>
  );
}
