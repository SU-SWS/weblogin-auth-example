/**
 * =============================================================================
 * ROOT LAYOUT - app/layout.tsx
 * =============================================================================
 *
 * This is the root layout component that wraps all pages in your application.
 * It provides the HTML structure, global styles, and shared components.
 *
 * DYNAMIC RENDERING:
 * We use `export const dynamic = 'force-dynamic'` to ensure this layout
 * (and all pages using it) are rendered dynamically on each request.
 * This is necessary because:
 * - The Header component reads cookies to check auth state
 * - Cookies can only be read during server-side rendering
 * - Static generation would cache the auth state incorrectly
 *
 * WITHOUT force-dynamic:
 * - Pages might be statically generated at build time
 * - The Header would always show "logged out" state
 * - Users would see stale auth state until a full page reload
 *
 * ACCESSIBILITY FEATURES:
 * - lang="en" attribute for screen readers
 * - Skip link in Header for keyboard navigation
 * - Semantic HTML structure
 * =============================================================================
 */

import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

// CRITICAL: Force all pages to render dynamically
// This ensures cookies (session data) are read fresh on each request
// Without this, the Header auth state could be cached incorrectly
export const dynamic = 'force-dynamic';

// Page metadata - appears in browser tab and search results
export const metadata: Metadata = {
  title: "Weblogin Auth SDK Example",
  description: "A complete example showcasing the Weblogin Auth SDK features",
};

/**
 * Root Layout Component
 *
 * This component is rendered once and wraps all pages. The {children}
 * prop contains the current page's content.
 *
 * STRUCTURE:
 * - <html>: Root element with language attribute
 * - <body>: Contains all visible content with global styles
 * - Header: Shared navigation/auth component
 * - {children}: Current page content
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased min-h-screen bg-gray-900 text-white font-sans"
      >
        {/* Centered container with max width for readability */}
        <div className="max-w-6xl mx-auto p-8">
          {/* Header appears on all pages - shows auth state */}
          <Header />
          {/* Page content rendered here */}
          {children}
        </div>
      </body>
    </html>
  );
}
