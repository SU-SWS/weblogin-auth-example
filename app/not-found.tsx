import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-8">
        <span className="text-9xl font-bold text-gray-700">404</span>
      </div>
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-300 mb-8 max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Go Home
        </Link>
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
