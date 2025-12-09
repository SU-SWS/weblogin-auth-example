/**
 * =============================================================================
 * SESSION PAGE - app/session/page.tsx
 * =============================================================================
 *
 * This page demonstrates session management features of the Weblogin Auth SDK:
 * - Reading session data (user info, custom meta data)
 * - Updating session data using Server Actions
 * - Displaying raw session JSON for debugging
 *
 * KEY CONCEPTS:
 *
 * 1. SERVER COMPONENT WITH SERVER ACTIONS
 *    This is an async server component that defines Server Actions.
 *    Server Actions are async functions marked with 'use server' that
 *    can be called from client components (like SessionForm).
 *
 * 2. SESSION STRUCTURE
 *    The session object contains:
 *    - user: SAML attributes from authentication (name, email, uid, etc.)
 *    - meta: Custom data you can add/modify (preferences, state, etc.)
 *    - Internal fields for session management
 *
 * 3. UPDATING SESSIONS
 *    auth.updateSession() merges new data with existing session.
 *    Use session.meta for custom data - it won't interfere with user data.
 *
 * 4. REVALIDATION
 *    After updating the session, we call revalidatePath() to tell Next.js
 *    to re-fetch the page data. This ensures the UI shows updated values.
 *
 * FLOW:
 * 1. User fills out key/value form in SessionForm (client component)
 * 2. Form calls updateSession Server Action
 * 3. Server Action updates session and revalidates path
 * 4. Page re-renders with new session data
 * =============================================================================
 */

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import SessionForm from './SessionForm';
import BackToHome from '@/app/components/BackToHome';

export default async function SessionPage() {
  // Get the current session - includes user data and custom meta
  const session = await auth.getSession();

  /**
   * SERVER ACTION: Update session with custom data
   *
   * This function is marked with 'use server' which means:
   * - It runs on the server, not the client
   * - It can be passed to client components and called like a regular function
   * - It can access server-only resources (database, auth, etc.)
   *
   * The function receives FormData from the form submission and adds
   * the key/value pair to the session's meta object.
   */
  async function updateSession(formData: FormData) {
    'use server';

    // Extract form values
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;

    if (key && value) {
      // Get current session to preserve existing meta data
      // Without this, we'd overwrite all existing meta with just the new key
      const currentSession = await auth.getSession();
      const existingMeta = currentSession?.meta || {};

      // Update session with merged meta data
      // The spread operator preserves existing keys while adding/updating the new one
      await auth.updateSession({
        meta: {
          ...existingMeta,
          [key]: value
        }
      });

      // Tell Next.js to refetch this page's data
      // Without this, the page would show stale data until a full refresh
      revalidatePath('/session');
    }
  }

  // If no session, show login prompt
  // This page isn't protected by middleware, so we handle auth state here
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
      <BackToHome />
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Session Details</h1>
        <p className="text-gray-400 mt-2">View and manage your current session data.</p>
      </div>

      {/* User Information from SAML assertion */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-purple-400">User Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Name</span>
            <span className="font-medium">{String(session.user?.name || 'N/A')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">UID</span>
            <span className="font-medium">{String(session.user?.uid || 'N/A')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Email</span>
            <span className="font-medium">{String(session.user?.email || 'N/A')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Affiliation</span>
            <span className="font-medium">{String(session.user?.eduPersonAffiliation || 'N/A')}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">Session Active</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
              Active
            </span>
          </div>
        </div>
      </div>

      {/*
        SessionForm: Client component for adding custom session data
        We pass the server action as a prop - the client component can
        call it to trigger server-side session updates
      */}
      <SessionForm meta={session.meta} updateSessionAction={updateSession} />

      {/* Raw session JSON for debugging */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Raw Session Data</h2>
        <pre className="bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-300 border border-gray-700">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
