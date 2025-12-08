import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth.getSession();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Weblogin Auth SDK</h1>
          {session ? (
            <div className="flex items-center gap-4">
              <span>Welcome, {session.user?.name || session.user?.userName}</span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <a href="/api/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors font-semibold">
              Login
            </a>
          )}
        </header>

        <main>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              {session ? 'Ready to Build' : 'Secure Authentication'}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {session
                ? 'Explore the features below to see how the SDK handles session management, route protection, and API security.'
                : 'A complete example showcasing the Weblogin Auth SDK features. Log in to access protected resources and view session details.'}
            </p>
            {!session && (
              <div className="mt-8">
                <a
                  href="https://github.com/SU-SWS/weblogin-auth-sdk/tree/v3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                >
                  View on GitHub
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Protected Page */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold mb-3 text-blue-400">Protected Page</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                Demonstrates route protection using Next.js middleware (proxy). Only authenticated users can access this page.
              </p>
              <Link href="/protected" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                Visit Page
              </Link>
            </div>

            {/* Card 2: Session Info */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold mb-3 text-purple-400">Session Info</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                Inspect the decrypted session data and learn how to add custom attributes to the user session.
              </p>
              <Link href="/session" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                View Session
              </Link>
            </div>

            {/* Card 3: Protected API */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold mb-3 text-green-400">Protected API</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                A secure API endpoint example. Returns JSON data only when a valid session cookie is present.
              </p>
              <Link href="/api/protected" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                Test API
              </Link>
            </div>

            {/* Card 4: Metadata */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold mb-3 text-yellow-400">SAML Metadata</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                View the generated Service Provider metadata XML. This is used to configure the Identity Provider.
              </p>
              <a href="/api/auth/metadata" target="_blank" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                View Metadata
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
