import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth.getSession();

  return (
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

        {/* Card 5: CSRF Protection */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
          <h3 className="text-xl font-bold mb-3 text-red-400">CSRF Protection</h3>
          <p className="text-gray-400 mb-6 flex-grow">
            Learn how to protect your forms against Cross-Site Request Forgery attacks using the SDK&apos;s built-in utilities.
          </p>
          <Link href="/csrf-demo" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
            View Demo
          </Link>
        </div>

        {/* Card 6: GitHub Repository */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
          <h3 className="text-xl font-bold mb-3 text-gray-300">GitHub Repository</h3>
          <p className="text-gray-400 mb-6 flex-grow">
            View the source code, documentation, and contribute to the Weblogin Auth SDK on GitHub.
          </p>
          <a
            href="https://github.com/SU-SWS/weblogin-auth-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
