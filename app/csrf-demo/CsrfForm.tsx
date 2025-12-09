'use client';

import { useState, useTransition, useEffect } from 'react';

interface CsrfFormProps {
  csrfToken?: string;
  submitSecureForm: (formData: FormData) => Promise<void>;
  submitWithoutCsrf: (formData: FormData) => Promise<void>;
  initializeCsrfToken: () => Promise<void>;
  lastMessage?: string;
  lastSubmission?: string;
}

export default function CsrfForm({
  csrfToken,
  submitSecureForm,
  submitWithoutCsrf,
  initializeCsrfToken,
  lastMessage,
  lastSubmission
}: CsrfFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [activeAction, setActiveAction] = useState<'secure' | 'attack' | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Initialize CSRF token if it doesn't exist
  useEffect(() => {
    if (!csrfToken) {
      startTransition(async () => {
        await initializeCsrfToken();
      });
    }
  }, [csrfToken, initializeCsrfToken]);

  // Animate result appearance
  useEffect(() => {
    if (result) {
      setShowResult(true);
      const timer = setTimeout(() => setShowResult(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Show loading state while initializing token
  if (!csrfToken) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-green-400">Interactive Demo</h2>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-green-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-400">Initializing CSRF token...</span>
        </div>
      </div>
    );
  }

  const handleSecureSubmit = async (formData: FormData) => {
    setResult(null);
    setActiveAction('secure');
    startTransition(async () => {
      try {
        await submitSecureForm(formData);
        setResult({
          success: true,
          message: 'Form submitted successfully! CSRF token validated and rotated.'
        });
      } catch (error) {
        setResult({
          success: false,
          message: error instanceof Error ? error.message : 'An error occurred'
        });
      }
      setActiveAction(null);
    });
  };

  const handleTamperedSubmit = async () => {
    setResult(null);
    setActiveAction('attack');
    const formData = new FormData();
    formData.set('_csrf', 'tampered-invalid-token');
    formData.set('message', 'Malicious message from attacker!');

    startTransition(async () => {
      try {
        await submitSecureForm(formData);
        setResult({
          success: true,
          message: 'Form submitted successfully!'
        });
      } catch (error) {
        setResult({
          success: false,
          message: 'CSRF validation failed! The tampered token was rejected.'
        });
      }
      setActiveAction(null);
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
      <h2 className="text-xl font-bold mb-4 text-green-400">Interactive Demo</h2>

      {/* Current Token Display */}
      <div className={`mb-6 p-4 bg-gray-900 rounded-lg border transition-all duration-500 ${
        activeAction === 'secure' ? 'border-green-500 shadow-lg shadow-green-500/20' :
        activeAction === 'attack' ? 'border-red-500 shadow-lg shadow-red-500/20 animate-pulse' :
        'border-gray-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Current CSRF Token:</span>
          <button
            onClick={() => setShowToken(!showToken)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showToken ? 'Hide' : 'Show'}
          </button>
        </div>
        <code className={`text-xs break-all transition-colors duration-300 ${
          activeAction === 'secure' ? 'text-green-400' :
          activeAction === 'attack' ? 'text-red-400' :
          'text-green-400'
        }`}>
          {showToken ? csrfToken : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
        </code>
      </div>

      {/* Result Message */}
      <div className={`mb-6 overflow-hidden transition-all duration-500 ease-out ${
        result && showResult ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {result && (
          <div className={`p-4 rounded-lg border transform transition-all duration-500 ${
            result.success
              ? 'bg-green-900/30 border-green-700 text-green-300 animate-pulse'
              : 'bg-red-900/30 border-red-700 text-red-300 animate-shake'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>{result.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Form Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-white">Test CSRF Protection</h3>
        <p className="text-sm text-gray-400 mb-4">
          Enter a message and try both buttons to see how CSRF protection works.
        </p>
        <form action={handleSecureSubmit} className="space-y-4">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
            <input
              name="message"
              type="text"
              required
              disabled={isPending}
              className={`w-full bg-gray-700 border p-3 rounded text-white placeholder-gray-500 focus:outline-none transition-all duration-300 disabled:opacity-50 ${
                activeAction === 'secure' ? 'border-green-500 ring-2 ring-green-500/30' :
                activeAction === 'attack' ? 'border-red-500 ring-2 ring-red-500/30' :
                'border-gray-600 focus:border-green-400'
              }`}
              placeholder="Enter a message to submit"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Secure Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 transform ${
                isPending && activeAction === 'secure' ? 'scale-95 opacity-80' :
                isPending ? 'opacity-50' :
                'hover:scale-105 active:scale-95'
              }`}
            >
              {isPending && activeAction === 'secure' ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Submit Securely</span>
                </>
              )}
            </button>

            {/* Attack Button */}
            <button
              type="button"
              onClick={handleTamperedSubmit}
              disabled={isPending}
              className={`bg-red-600 hover:bg-red-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 transform ${
                isPending && activeAction === 'attack' ? 'scale-95 opacity-80 animate-pulse' :
                isPending ? 'opacity-50' :
                'hover:scale-105 active:scale-95'
              }`}
            >
              {isPending && activeAction === 'attack' ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Attacking...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Simulate Attack</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-green-400">Submit Securely</span> uses the valid CSRF token. <span className="text-red-400">Simulate Attack</span> uses a tampered token.
          </p>
        </form>
      </div>

      {/* Last Submission Info */}
      {lastMessage && (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 animate-fadeIn">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Last Successful Submission:</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Message:</span>
              <span className="text-white">{lastMessage}</span>
            </div>
            {lastSubmission && (
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="text-white">{new Date(lastSubmission).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
