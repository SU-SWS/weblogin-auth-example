import Link from 'next/link';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import SessionForm from './SessionForm';

export default async function SessionPage() {
  const session = await auth.getSession();

  async function updateSession(formData: FormData) {
    'use server';
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;

    if (key && value) {
      // Get current session to preserve existing meta data
      const currentSession = await auth.getSession();
      const existingMeta = currentSession?.meta || {};

      await auth.updateSession({
        meta: {
          ...existingMeta,
          [key]: value
        }
      });
      revalidatePath('/session');
    }
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">No Active Session</h1>
        <p className="text-gray-400 mb-6">You must be logged in to view session information.</p>
        <a
          href="/api/auth/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors font-semibold"
        >
          Login
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Session Details</h1>
        <p className="text-gray-400 mt-2">View and manage your current session data.</p>
      </div>

      {/* User Information Card */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-purple-400">User Information</h2>
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

      {/* Custom Data and Form */}
      <SessionForm meta={session.meta} updateSessionAction={updateSession} />

      {/* Raw Session Data Card */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Raw Session Data</h2>
        <pre className="bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-300 border border-gray-700">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
