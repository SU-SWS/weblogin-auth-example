'use client';

import { useEffect, useState, useTransition } from 'react';

interface SessionFormProps {
  meta: Record<string, unknown> | undefined;
  updateSessionAction: (formData: FormData) => Promise<void>;
}

export default function SessionForm({ meta, updateSessionAction }: SessionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const metaEntries = meta ? Object.entries(meta) : [];

  useEffect(() => {
    if (newKey) {
      const timer = setTimeout(() => setNewKey(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [newKey]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = async (formData: FormData) => {
    const key = formData.get('key') as string;
    startTransition(async () => {
      await updateSessionAction(formData);
      setNewKey(key);
      setShowSuccess(true);
    });
  };

  return (
    <>
      {/* Custom Session Data Card */}
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

      {/* Add to Session Card */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6 relative overflow-hidden">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Add Custom Session Data</h2>

        {/* Success notification */}
        <div
          className={`absolute top-4 right-4 flex items-center gap-2 bg-green-900/90 text-green-300 px-4 py-2 rounded-lg transition-all duration-300 transform
            ${showSuccess ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Added successfully!</span>
        </div>

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
