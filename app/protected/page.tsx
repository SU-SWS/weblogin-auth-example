import Link from 'next/link';
import { auth } from '@/lib/auth';
import { type Session } from 'weblogin-auth-sdk';

export default async function ProtectedPage() {
  const session: Session | null = await auth.getSession();

  if (!session || !session.user || !session.user.name) {
    // Access denied, return 403, but this should be handled by middleware by this point.
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-6">You must be logged in to view this page.</p>
        <a
          href="/api/auth/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors font-semibold"
        >
          Login
        </a>
      </div>
    );
  }

  const userName = session.user?.name || session.user?.userName;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {userName}!</h1>
        <p className="text-gray-400 mt-2">You have successfully accessed the protected page.</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Session Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Name</span>
            <span className="font-medium">{session.user?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">UID</span>
            <span className="font-medium">{session.user?.uid || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Email</span>
            <span className="font-medium">{session.user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Affiliation</span>
            <span className="font-medium">{session.user?.eduPersonAffiliation || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Cookie Expires</span>
            <span className="font-medium">
              {session.cookie?.expires
                ? new Date(session.cookie.expires).toLocaleString()
                : 'Session cookie (expires when browser closes)'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">Session Active</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
