import BackToHome from '@/app/components/BackToHome';
import CodeBlock from '@/app/components/CodeBlock';

const authConfigCode = `saml: {
  // ... other config

  // Enable signing of metadata (Required for this feature)
  signMetadata: true,

  // Enable skipping ACS URL validation
  skipRequestAcsUrl: process.env.WEBLOGIN_AUTH_SAML_SKIP_ACS_VALIDATION === 'true',
}`;

const envCode = `WEBLOGIN_AUTH_SAML_SKIP_ACS_VALIDATION="true"`;

export default async function SkipValidationPage() {
  return (
    <main id="main-content">
      <BackToHome />

      <div className="mb-8">
        <h1 className="text-4xl font-bold">Skip Endpoint Validation</h1>
        <p className="text-gray-300 mt-2">
          How to use a single IdP configuration for multiple environments.
        </p>
      </div>

      <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">The Problem</h2>
        <p className="text-gray-300 mb-4">
          SAML Identity Providers (IdPs) typically require a strict match between the
          Assertion Consumer Service (ACS) URL configured in the IdP and the one sent
          in the SAML request.
        </p>
        <p className="text-gray-300 mb-4">This creates a challenge for:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
          <li>Local development (localhost)</li>
          <li>Deploy previews (dynamic URLs like *.netlify.app)</li>
          <li>Staging environments</li>
        </ul>
        <p className="text-gray-300 mt-4">
          Traditionally, you would need to register separate Assertion Consumer Service (ACS) URLs for each environment.
        </p>
      </section>

      <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">The Solution</h2>
        <p className="text-gray-300 mb-4">
          The <code className="bg-gray-900 px-1 rounded">weblogin-auth-sdk</code> supports a{' '}
          <code className="bg-gray-900 px-1 rounded">skipRequestAcsUrl</code> option.
          When enabled, the SDK does not send the{' '}
          <code className="bg-gray-900 px-1 rounded">AssertionConsumerServiceURL</code> in the SAML AuthnRequest.
        </p>
        <p className="text-gray-300">
          Stanford&apos;s IdP supports this via the{' '}
          <a
            href="https://uit.stanford.edu/service/saml/skipendpointvalidation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            skipEndpointValidation
          </a>{' '}
          feature. This allows the IdP to accept requests from any URL as long as the
          Entity ID matches and the request is signed with the registered certificate.
        </p>
      </section>

      <section aria-label="Configuration">
        <h2 className="text-2xl font-bold mb-6">Configuration</h2>

        <article className="mb-6">
          <div className="mb-3">
            <h3 className="font-semibold text-orange-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              1. Update lib/auth.ts
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Enable the skipRequestAcsUrl option and ensure metadata signing is enabled.
            </p>
          </div>
          <CodeBlock code={authConfigCode} filename="lib/auth.ts" />
        </article>

        <article className="mb-6">
          <div className="mb-3">
            <h3 className="font-semibold text-orange-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              2. Environment Variables
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Set this variable in your non-production environments (localhost, previews, staging).
            </p>
          </div>
          <CodeBlock code={envCode} filename=".env.local" />
        </article>

        <article className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <h3 className="font-semibold text-orange-400 flex items-center gap-2 mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            3. IdP Registration (spdb.stanford.edu)
          </h3>
          <p className="text-gray-300">
            When registering your SP with <a href='https://spdb.stanford.edu'>SPDB</a>, to enable&nbsp;
            <code className="bg-gray-900 px-1 rounded">skipEndpointValidation</code> for your Entity ID.
            You must provide your metadata with a valid signing certificate.
          </p>
        </article>

        <div className="bg-orange-900/30 border border-orange-700 rounded-xl p-6">
          <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Important Notes
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-1">•</span>
              <span><strong>Signed Metadata Required:</strong> The IdP verifies the signature on your metadata to trust dynamic ACS URLs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-1">•</span>
              <span><strong>Same Entity ID:</strong> All environments must use the same Entity ID registered with the IdP.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-1">•</span>
              <span><strong>Same Certificates:</strong> All environments must use the same signing certificate registered with the IdP.</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
