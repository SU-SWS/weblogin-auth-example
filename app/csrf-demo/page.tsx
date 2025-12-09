import Link from 'next/link';
import { auth } from '@/lib/auth';
import { AuthUtils } from 'weblogin-auth-sdk';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import CsrfForm from './CsrfForm';

async function initializeCsrfToken() {
  'use server';
  const session = await auth.getSession();
  if (session && !session.meta?.csrfToken) {
    const csrfToken = AuthUtils.generateCSRFToken();
    await auth.updateSession({
      meta: {
        ...session.meta,
        csrfToken
      }
    });
    revalidatePath('/csrf-demo');
    redirect('/csrf-demo');
  }
}

export default async function CsrfDemoPage() {
  const session = await auth.getSession();

  // Check if we need to initialize the CSRF token
  const csrfToken = session?.meta?.csrfToken as string | undefined;

  async function submitSecureForm(formData: FormData) {
    'use server';

    const submittedToken = formData.get('_csrf') as string;
    const message = formData.get('message') as string;

    // Get the current session to retrieve the stored CSRF token
    const currentSession = await auth.getSession();
    const expectedToken = currentSession?.meta?.csrfToken as string;

    // Validate the CSRF token
    const isValid = AuthUtils.validateCSRFToken(submittedToken, expectedToken);

    if (!isValid) {
      // In a real app, you might want to handle this differently
      throw new Error('CSRF token validation failed! This could be a cross-site request forgery attempt.');
    }

    // Generate a new CSRF token for the next request (token rotation)
    const newToken = AuthUtils.generateCSRFToken();
    await auth.updateSession({
      meta: {
        ...currentSession?.meta,
        csrfToken: newToken,
        lastMessage: message,
        lastSubmission: new Date().toISOString()
      }
    });

    revalidatePath('/csrf-demo');
  }

  async function submitWithoutCsrf(formData: FormData) {
    'use server';

    const message = formData.get('message') as string;

    // This form doesn't validate CSRF - for demonstration purposes only
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold">CSRF Protection Demo</h1>
        <p className="text-gray-400 mt-2">Learn how to protect your forms against Cross-Site Request Forgery attacks.</p>
      </div>

      {/* What is CSRF Card */}
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

      {/* How it Works Card */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-purple-400">How It Works</h2>
        <div className="space-y-4 text-gray-300">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-900 text-purple-300 rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-medium text-white">Generate a Token</p>
              <p className="text-sm text-gray-400">When rendering the form, generate a unique CSRF token and store it in the user&apos;s session.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-900 text-purple-300 rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-medium text-white">Include in Form</p>
              <p className="text-sm text-gray-400">Add the token as a hidden field in your form.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-900 text-purple-300 rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-medium text-white">Validate on Submit</p>
              <p className="text-sm text-gray-400">Compare the submitted token with the one stored in the session using constant-time comparison.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-900 text-purple-300 rounded-full flex items-center justify-center font-bold">4</div>
            <div>
              <p className="font-medium text-white">Rotate Token</p>
              <p className="text-sm text-gray-400">Generate a new token after each successful submission to prevent replay attacks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <CsrfForm
        csrfToken={csrfToken}
        submitSecureForm={submitSecureForm}
        submitWithoutCsrf={submitWithoutCsrf}
        initializeCsrfToken={initializeCsrfToken}
        lastMessage={session?.meta?.lastMessage as string}
        lastSubmission={session?.meta?.lastSubmission as string}
      />

      {/* Code Example Card */}
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
