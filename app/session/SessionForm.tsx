/**
 * =============================================================================
 * SESSION FORM COMPONENT - app/session/SessionForm.tsx
 * =============================================================================
 *
 * A client component that allows users to add custom key-value pairs to their
 * session. Demonstrates how to use auth.updateSession() with Server Actions.
 *
 * KEY CONCEPTS:
 *
 * 1. CLIENT COMPONENT
 *    Uses 'use client' because it needs:
 *    - useState for UI feedback (success animation, pending state)
 *    - useTransition for non-blocking form submission
 *
 * 2. SERVER ACTIONS
 *    The form calls updateSessionAction which is defined in the parent
 *    server component. Server Actions allow client components to trigger
 *    server-side code securely.
 *
 * 3. SESSION META
 *    Sessions have a `meta` object where you can store custom data.
 *    This is perfect for user preferences, feature flags, or app state
 *    that should persist across requests.
 *
 * USAGE:
 * ```tsx
 * // In a server component
 * async function updateSession(formData: FormData) {
 *   'use server';
 *   await auth.updateSession({ meta: { [key]: value } });
 * }
 *
 * return <SessionForm meta={session.meta} updateSessionAction={updateSession} />;
 * ```
 *
 * UI FEATURES:
 * - Shows existing session meta data
 * - Highlights newly added keys with animation
 * - Loading state on button during submission
 * - Success toast notification
 * =============================================================================
 */

'use client';

import { useEffect, useState, useTransition } from 'react';

interface SessionFormProps {
  meta: Record<string, unknown> | undefined;  // Current session meta data
  updateSessionAction: (formData: FormData) => Promise<void>;  // Server Action
}

export default function SessionForm({ meta, updateSessionAction }: SessionFormProps) {
  // useTransition provides isPending state without blocking the UI
  const [isPending, startTransition] = useTransition();

  // Track the most recently added key for highlight animation
  const [newKey, setNewKey] = useState<string | null>(null);

  // Control success notification visibility
  const [showSuccess, setShowSuccess] = useState(false);

  // Convert meta object to array for rendering
  const metaEntries = meta ? Object.entries(meta) : [];

  // Clear the highlight effect after 2 seconds
  useEffect(() => {
    if (newKey) {
      const timer = setTimeout(() => setNewKey(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [newKey]);

  // Hide success notification after 2 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  /**
   * Handle form submission
   * Uses startTransition to keep UI responsive during the server action
   */
  const handleSubmit = async (formData: FormData) => {
    const key = formData.get('key') as string;
    startTransition(async () => {
      // Call the server action passed from parent
      await updateSessionAction(formData);
      // Trigger UI feedback
      setNewKey(key);
      setShowSuccess(true);
    });
  };

  return (
    <>
      {/* Display current session meta data */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-green-400">Custom Session Data</h2>
        {metaEntries.length > 0 ? (
          <div className="space-y-3">
            {metaEntries.map(([key, value], index) => (
              <div
                key={key}
                className={`flex justify-between items-center py-2 transition-all duration-500 ease-out
                  ${index < metaEntries.length - 1 ? 'border-b border-gray-700' : ''}
                  ${newKey === key ? 'animate-highlight bg-green-900/30 -mx-2 px-2 rounded' : ''}`}
              >
                <span className="text-gray-400">{key}</span>
                <span className={`font-medium transition-all duration-300 ${newKey === key ? 'text-green-400 scale-105' : ''}`}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No custom data added yet. Use the form below to add some!</p>
        )}
      </div>

      {/* Form to add new session data */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6 relative overflow-hidden">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Add Custom Session Data</h2>

        {/* Success notification - slides in from right */}
        <div
          className={`absolute top-4 right-4 flex items-center gap-2 bg-green-900/90 text-green-300 px-4 py-2 rounded-lg transition-all duration-300 transform
            ${showSuccess ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Added successfully!</span>
        </div>

        {/*
          Form with Server Action
          The action prop accepts the handleSubmit function which calls
          the server action via startTransition
        */}
        <form action={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-400 mb-2">Key</label>
            <input
              name="key"
              type="text"
              required
              className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
              placeholder="e.g. theme"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-400 mb-2">Value</label>
            <input
              name="value"
              type="text"
              required
              className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
              placeholder="e.g. dark"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={`bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition-all duration-200 font-medium
              ${isPending ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </span>
            ) : (
              'Add to Session'
            )}
          </button>
        </form>
      </div>
    </>
  );
}
