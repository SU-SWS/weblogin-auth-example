/**
 * =============================================================================
 * CSRF DEMO PAGE - app/csrf-demo/page.tsx
 * =============================================================================
 *
 * An interactive demonstration of Cross-Site Request Forgery (CSRF) protection
 * using the Weblogin Auth SDK's built-in utilities.
 *
 * WHAT IS CSRF?
 * CSRF attacks trick authenticated users into performing unwanted actions.
 * Example: An attacker's website includes a hidden form that submits to your
 * banking app to transfer money - if you're logged into your bank, the request
 * succeeds because your browser sends your session cookie automatically.
 *
 * HOW TO PREVENT CSRF:
 * 1. Generate a random token and store it in the user's session
 * 2. Include the token as a hidden field in forms
 * 3. Validate the submitted token matches the session token
 * 4. Attackers can't know the token, so their forged requests fail
 *
 * SDK UTILITIES:
 * - AuthUtils.generateCSRFToken(): Creates a cryptographically secure random token
 * - AuthUtils.validateCSRFToken(): Compares tokens using constant-time comparison
 *   (prevents timing attacks that could guess the token character by character)
 *
 * TOKEN ROTATION:
 * After each successful form submission, we generate a new token. This prevents
 * replay attacks where an attacker captures and reuses a valid token.
 *
 * THIS DEMO SHOWS:
 * - Secure form: Validates CSRF token before processing
 * - Attack simulation: Uses a fake token to show validation failure
 * =============================================================================
 */

import { auth } from '@/lib/auth';
import { AuthUtils } from 'weblogin-auth-sdk';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import CsrfForm from './CsrfForm';
import BackToHome from '@/app/components/BackToHome';

/**
 * SERVER ACTION: Initialize CSRF token for new sessions
 *
 * Called automatically when a user visits this page without a CSRF token.
 * Generates a token and stores it in the session for form protection.
 */
async function initializeCsrfToken() {
  'use server';
  const session = await auth.getSession();

  // Only initialize if session exists but has no token yet
  if (session && !session.meta?.csrfToken) {
    // Generate a cryptographically secure random token
    const csrfToken = AuthUtils.generateCSRFToken();

    // Store in session meta (preserving any existing meta data)
    await auth.updateSession({
      meta: {
        ...session.meta,
        csrfToken
      }
    });

    // Refresh the page to show the new token
    revalidatePath('/csrf-demo');
    redirect('/csrf-demo');
  }
}

export default async function CsrfDemoPage() {
  const session = await auth.getSession();

  // Get the current CSRF token from session (may be undefined initially)
  const csrfToken = session?.meta?.csrfToken as string | undefined;

  /**
   * SERVER ACTION: Process secure form submission
   *
   * This demonstrates proper CSRF protection:
   * 1. Extract the submitted token from form data
   * 2. Compare against the expected token in session
   * 3. Reject if they don't match
   * 4. Rotate the token for the next request
   */
  async function submitSecureForm(formData: FormData) {
    'use server';

    // Get submitted values
    const submittedToken = formData.get('_csrf') as string;
    const message = formData.get('message') as string;

    // Get the expected token from session
    const currentSession = await auth.getSession();
    const expectedToken = currentSession?.meta?.csrfToken as string;

    // CRITICAL: Validate the CSRF token
    // validateCSRFToken uses constant-time comparison to prevent timing attacks
    const isValid = AuthUtils.validateCSRFToken(submittedToken, expectedToken);

    if (!isValid) {
      // Token mismatch = potential CSRF attack
      // In production, you might want to:
      // - Log the attempt for security monitoring
      // - Invalidate the session
      // - Show a user-friendly error page
      throw new Error('CSRF token validation failed! This could be a cross-site request forgery attempt.');
    }

    // TOKEN ROTATION: Generate a new token for the next request
    // This prevents replay attacks - even if an attacker somehow got a valid
    // token, it becomes useless after a single use
    const newToken = AuthUtils.generateCSRFToken();

    // Update session with new token and record the submission
    await auth.updateSession({
      meta: {
        ...currentSession?.meta,
        csrfToken: newToken,           // New token for next request
        lastMessage: message,          // Store for display
        lastSubmission: new Date().toISOString()
      }
    });

    // Refresh the page to show updated data
    revalidatePath('/csrf-demo');
  }

  /**
   * SERVER ACTION: Unsafe form submission (for demonstration only)
   *
   * This shows what happens without CSRF protection - DON'T do this in production!
   * Included only to demonstrate the security difference.
   */
  async function submitWithoutCsrf(formData: FormData) {
    'use server';

    const message = formData.get('message') as string;

    // NO CSRF VALIDATION - This is unsafe!
    // Any site could submit to this endpoint using the user's session
    const currentSession = await auth.getSession();
    await auth.updateSession({
      meta: {
        ...currentSession?.meta,
        unsafeMessage: message,
        unsafeSubmission: new Date().toISOString()
      }
    });

    revalidatePath('/csrf-demo');
  }

  // Require authentication to view this page
  if (!session) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-400 mb-6">You must be logged in to view the CSRF protection demo.</p>
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
        <h1 className="text-4xl font-bold">CSRF Protection Demo</h1>
        <p className="text-gray-400 mt-2">Learn how to protect your forms against Cross-Site Request Forgery attacks.</p>
      </div>

      {/* Educational: What is CSRF? */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-400">What is CSRF?</h2>
        <p className="text-gray-300 mb-4">
          Cross-Site Request Forgery (CSRF) is an attack that tricks users into submitting malicious requests.
          An attacker can create a form on their site that submits to your application, potentially
          performing actions on behalf of authenticated users without their knowledge.
        </p>
        <p className="text-gray-300">
          The SDK provides <code className="bg-gray-700 px-2 py-1 rounded text-yellow-400">AuthUtils.generateCSRFToken()</code> and{' '}
          <code className="bg-gray-700 px-2 py-1 rounded text-yellow-400">AuthUtils.validateCSRFToken()</code> to help protect your forms.
        </p>
      </div>

      {/* Educational: How CSRF Protection Works */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-purple-400">How It Works</h2>
        <div className="space-y-4 text-gray-300">
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 bg-purple-900 text-purple-300 rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-medium text-white">Generate a Token</p>
              <p className="text-sm text-gray-400">When rendering the form, generate a unique CSRF token and store it in the user&apos;s session.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 bg-purple-900 text-purple-300 rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-medium text-white">Include in Form</p>
              <p className="text-sm text-gray-400">Add the token as a hidden field in your form.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 bg-purple-900 text-purple-300 rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-medium text-white">Validate on Submit</p>
              <p className="text-sm text-gray-400">Compare the submitted token with the one stored in the session using constant-time comparison.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 bg-purple-900 text-purple-300 rounded-full flex items-center justify-center font-bold">4</div>
            <div>
              <p className="font-medium text-white">Rotate Token</p>
              <p className="text-sm text-gray-400">Generate a new token after each successful submission to prevent replay attacks.</p>
            </div>
          </div>
        </div>
      </div>

      {/*
        Interactive Demo Component
        Server Actions are passed as props to the client component
      */}
      <CsrfForm
        csrfToken={csrfToken}
        submitSecureForm={submitSecureForm}
        submitWithoutCsrf={submitWithoutCsrf}
        initializeCsrfToken={initializeCsrfToken}
        lastMessage={session?.meta?.lastMessage as string}
        lastSubmission={session?.meta?.lastSubmission as string}
      />

      {/* Code Examples */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Code Example</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Generate and store token:</p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-300 border border-gray-700">
{`import { AuthUtils } from 'weblogin-auth-sdk';

// Generate token
const csrfToken = AuthUtils.generateCSRFToken();

// Store in session
await auth.updateSession({
  meta: { csrfToken }
});`}
            </pre>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Include in form:</p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-300 border border-gray-700">
{`<form action={submitAction}>
  <input type="hidden" name="_csrf" value={csrfToken} />
  {/* ... other form fields */}
</form>`}
            </pre>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Validate on submission:</p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-300 border border-gray-700">
{`const submittedToken = formData.get('_csrf');
const expectedToken = session?.meta?.csrfToken;

if (!AuthUtils.validateCSRFToken(submittedToken, expectedToken)) {
  throw new Error('CSRF validation failed');
}

// Generate new token for next request (rotation)
const newToken = AuthUtils.generateCSRFToken();
await auth.updateSession({
  meta: { csrfToken: newToken }
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
