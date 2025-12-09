/**
 * =============================================================================
 * BACK TO HOME COMPONENT - app/components/BackToHome.tsx
 * =============================================================================
 *
 * A simple breadcrumb-style navigation component that provides a "Back to Home"
 * link. Used on interior pages to help users navigate back to the main page.
 *
 * ACCESSIBILITY FEATURES:
 * - Uses <nav> with aria-label="Breadcrumb" for proper landmark
 * - Link has clear text describing the destination
 * - Hover animation provides visual feedback
 *
 * USAGE:
 * Import and add at the top of your page content:
 * ```tsx
 * import BackToHome from '@/app/components/BackToHome';
 *
 * export default function MyPage() {
 *   return (
 *     <main>
 *       <BackToHome />
 *       <h1>Page Title</h1>
 *       ...
 *     </main>
 *   );
 * }
 * ```
 * =============================================================================
 */

import Link from 'next/link';

export default function BackToHome() {
  return (
    // Breadcrumb navigation landmark for assistive technology
    <nav aria-label="Breadcrumb" className="mb-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
      >
        {/* Arrow icon - animates left on hover */}
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back to Home</span>
      </Link>
    </nav>
  );
}
