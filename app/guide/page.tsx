/**
 * =============================================================================
 * IMPLEMENTATION GUIDE - app/guide/page.tsx
 * =============================================================================
 *
 * A step-by-step guide to adding Stanford WebLogin to a Next.js app with
 * weblogin-auth-sdk, from first setup through yearly SPDB renewal.
 *
 * REAL CODE, NOT COPIES:
 * Code samples are read from this repo's actual files when the page renders
 * (see source() below), so the guide can't drift from the working code.
 * next.config.ts lists these files in outputFileTracingIncludes so they're
 * deployed with the serverless function on Netlify.
 * =============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import type { ReactNode } from 'react';
import BackToHome from '@/app/components/BackToHome';
import CodeBlock from '@/app/components/CodeBlock';

/**
 * Read a file from this repo, dropping its leading header comment (the guide
 * explains what each file is for).
 *
 * turbopackIgnore stops Next.js tracing the whole project (private keys and
 * .env files included) into the server bundle because of this dynamic path.
 * The files actually read are listed in next.config.ts instead.
 */
function source(file: string): string {
  const text = fs.readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), file), 'utf8');
  return text.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '').trimEnd();
}

const SECTIONS = [
  { id: 'how-it-works', title: 'How it works' },
  { id: 'prerequisites', title: 'Before you start' },
  { id: 'keys', title: '1. Generate keys' },
  { id: 'env', title: '2. Environment variables' },
  { id: 'configure', title: '3. Configure the SDK' },
  { id: 'routes', title: '4. Auth routes' },
  { id: 'protect', title: '5. Protect pages and APIs' },
  { id: 'local', title: '6. Run locally' },
  { id: 'register', title: '7. Register in SPDB' },
  { id: 'deploy', title: '8. Deploy' },
  { id: 'maintain', title: 'Keep it running' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
];

const envCode = `# Your SP Entity ID, as registered in SPDB (usually the production URL)
WEBLOGIN_AUTH_SAML_ENTITY="https://your-app.stanford.edu"

# Where the IdP sends users back to. Use https://localhost:3000 locally.
WEBLOGIN_AUTH_SAML_RETURN_ORIGIN="https://localhost:3000"

# At least 32 random characters: openssl rand -base64 48
WEBLOGIN_AUTH_SESSION_SECRET="..."

# Signing key pair (required)
WEBLOGIN_AUTH_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
WEBLOGIN_AUTH_SAML_CERT="-----BEGIN CERTIFICATE-----..."

# Encryption key pair (optional, set both or neither)
WEBLOGIN_AUTH_SAML_DECRYPTION_KEY="-----BEGIN PRIVATE KEY-----..."
WEBLOGIN_AUTH_SAML_DECRYPTION_CERT="-----BEGIN CERTIFICATE-----..."`;

const opensslCode = `openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \\
  -keyout sp-key.pem -out sp-cert.pem \\
  -subj "/CN=your-app.stanford.edu"`;

const metadataCode = `npm run metadata -- --origin https://your-app.stanford.edu

SP metadata
  Entity ID    https://your-app.stanford.edu
  ACS URL      https://your-app.stanford.edu/api/auth/callback
  validUntil   2027-11-16  (renew in SPDB before this date)
  Signature    valid
  signing      cert expires 2036-11-13, SHA-256 56:0A:62:...
  encryption   cert expires 2036-11-13, SHA-256 56:0A:62:...

✔ Wrote sp-metadata.xml`;

const checkCertsCode = `> node ./scripts/check-certs.mjs
check-certs: SAML certificates
  signing    cert (WEBLOGIN_AUTH_SAML_CERT) expires 2036-11-13, in 3649 days
  encryption cert (WEBLOGIN_AUTH_SAML_DECRYPTION_CERT) expires 2036-11-13, in 3649 days`;

const devScriptCode = `"scripts": {
  "dev": "next dev --experimental-https"
}`;

// --- Small layout helpers ---------------------------------------------------

function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mb-12 scroll-mt-8">
      <h2 id={`${id}-heading`} className="text-2xl font-bold mb-2">
        {title}
      </h2>
      {intro && <p className="text-gray-300 mb-6">{intro}</p>}
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-gray-300">{children}</div>;
}

function Callout({ tone = 'note', title, children }: { tone?: 'note' | 'warning'; title: string; children: ReactNode }) {
  const styles =
    tone === 'warning'
      ? 'bg-orange-900/30 border-orange-700 [&_h3]:text-orange-400'
      : 'bg-blue-900/30 border-blue-700 [&_h3]:text-blue-400';
  return (
    <aside className={`border rounded-xl p-6 ${styles}`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="text-gray-300 space-y-2">{children}</div>
    </aside>
  );
}

function FileExample({ file, children }: { file: string; children?: ReactNode }) {
  return (
    <article>
      {children && <div className="text-gray-300 mb-3">{children}</div>}
      <CodeBlock code={source(file)} filename={file} />
    </article>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="bg-gray-900 px-1 rounded">{children}</code>;
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc ml-6 space-y-2 text-gray-300">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// --- Page -------------------------------------------------------------------

export default function GuidePage() {
  return (
    <main id="main-content">
      <BackToHome />

      <div className="mb-8">
        <h1 className="text-4xl font-bold">Implementation Guide</h1>
        <p className="text-gray-300 mt-2 max-w-3xl">
          Add Stanford WebLogin to a Next.js app with <Code>weblogin-auth-sdk</Code>, register it in SPDB, and keep it
          running. Every code sample on this page is read from this site&apos;s own source, so it&apos;s exactly what runs
          here.
        </p>
      </div>

      <nav aria-label="On this page" className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-12">
        <h2 className="font-semibold mb-3">On this page</h2>
        <ol className="sm:columns-2 gap-x-8">
          {SECTIONS.map(({ id, title }) => (
            <li key={id} className="mb-1 break-inside-avoid">
              <a href={`#${id}`} className="text-blue-400 hover:underline">
                {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="how-it-works" title="How it works">
        <Panel>
          <ol className="list-decimal ml-6 space-y-2">
            <li>
              A visitor opens a protected page. <Code>proxy.ts</Code> finds no session and redirects to{' '}
              <Code>/api/auth/login</Code>.
            </li>
            <li>The login route builds a signed SAML AuthnRequest and redirects to Stanford&apos;s IdP.</li>
            <li>
              After sign-in, the IdP posts a signed (and optionally encrypted) assertion to{' '}
              <Code>/api/auth/callback</Code>, your ACS endpoint.
            </li>
            <li>
              The callback validates it, stores the user in an encrypted session cookie (<Code>weblogin-auth</Code>), and
              redirects back.
            </li>
            <li>
              Pages and API routes read the session with <Code>auth.getSession()</Code>. The proxy uses the SDK&apos;s
              edge session reader.
            </li>
          </ol>
        </Panel>
      </Section>

      <Section id="prerequisites" title="Before you start">
        <Bullets
          items={[
            'A Next.js 16 app using the App Router',
            <>Node.js 22.13 or later, required by weblogin-auth-sdk 4 (this site uses Node 24)</>,
            <>
              Access to <ExternalLink href="https://spdb.stanford.edu">SPDB</ExternalLink> to register a Service Provider
            </>,
            <>
              An <strong>Entity ID</strong>: a permanent, unique name for your SP, conventionally your production URL. It
              can&apos;t change after registration.
            </>,
            <>
              <Code>npm install weblogin-auth-sdk@^4.1.1</Code>
            </>,
          ]}
        />
      </Section>

      <Section id="keys" title="1. Generate keys" intro="Your SP needs a signing key pair, and can optionally use a second pair (or the same one) for encryption.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300 border border-gray-700 rounded-xl overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3">Key pair</th>
                <th className="p-3">Required?</th>
                <th className="p-3">Used for</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-700">
                <td className="p-3">Signing</td>
                <td className="p-3">
                  <strong>Required</strong>
                </td>
                <td className="p-3">Signing AuthnRequests and metadata</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-3">Encryption</td>
                <td className="p-3">Optional</td>
                <td className="p-3">Letting the IdP encrypt assertions to you. Set both the key and cert, or neither.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout title="Encryption: set both or neither">
          <p>
            The SDK rejects a config with only half of the encryption pair. A certificate without its key would tell the IdP
            to encrypt assertions your app can&apos;t decrypt. (Encryption is optional from <Code>weblogin-auth-sdk</Code>{' '}
            4.1.0; 3.x requires it.)
          </p>
        </Callout>
        <article>
          <p className="text-gray-300 mb-3">
            In this repo, <Code>npm run certs</Code> generates one pair and writes it to <Code>.env.local</Code>. In your
            own app, use openssl:
          </p>
          <CodeBlock code={opensslCode} filename="Terminal" />
        </article>
        <Bullets
          items={[
            <>
              <strong>10 years is fine.</strong> SP certificates are trusted because they&apos;re pinned in your SPDB
              metadata, not through a certificate authority, so a short lifetime only forces extra rotations.
            </>,
            'Never commit the key files. Keep them in a secrets manager (this site uses Vault).',
          ]}
        />
      </Section>

      <Section id="env" title="2. Environment variables">
        <CodeBlock code={envCode} filename=".env.local" />
        <Callout tone="warning" title="Always set idpCert explicitly">
          <p>
            If <Code>idpCert</Code> is missing from your config, the SDK falls back to the <Code>WEBLOGIN_AUTH_SAML_CERT</Code>{' '}
            env var for the <em>IdP</em> certificate. With the names above, that variable holds <em>your SP</em> certificate,
            so every login would fail validation. The config in step 3 sets <Code>idpCert: idps.prod.cert</Code>.
          </p>
        </Callout>
      </Section>

      <Section
        id="configure"
        title="3. Configure the SDK"
        intro="The SAML settings live in their own module so command-line scripts can use the exact same config as the site."
      >
        <FileExample file="lib/saml-config.ts">
          <p>
            Only imports from <Code>weblogin-auth-sdk</Code>, never <Code>weblogin-auth-sdk/next</Code>, so it also loads in
            plain Node (<Code>npm run metadata</Code> uses it).
          </p>
        </FileExample>
        <FileExample file="lib/auth.ts">
          <p>
            Creates the SDK instance <strong>lazily</strong>, on first use. Netlify bundles edge functions before environment
            variables are available, and an instance created at import time fails config validation during the build. The{' '}
            <Code>Proxy</Code> export lets you write <Code>auth.getSession()</Code> anywhere.
          </p>
        </FileExample>
      </Section>

      <Section id="routes" title="4. Auth routes">
        <FileExample file="app/api/auth/login/route.ts">
          <p>
            Starts the login. Passing the request&apos;s <Code>origin</Code> sends users back to the deployment they came
            from: localhost, a deploy preview, or production.
          </p>
        </FileExample>
        <FileExample file="app/api/auth/callback/route.ts">
          <p>Your ACS endpoint. Validates the SAML response and creates the session.</p>
        </FileExample>
        <FileExample file="app/api/auth/logout/route.ts">
          <p>Clears the session cookie.</p>
        </FileExample>
        <FileExample file="app/api/auth/metadata/route.ts">
          <p>Serves your SP metadata. For SPDB, prefer <Code>npm run metadata</Code> (step 7).</p>
        </FileExample>
      </Section>

      <Section id="protect" title="5. Protect pages and APIs">
        <FileExample file="proxy.ts">
          <p>
            Next.js runs <Code>proxy.ts</Code> on the edge (a Netlify Edge Function in production), where the Node-based{' '}
            <Code>auth</Code> instance isn&apos;t available. Use <Code>createEdgeSessionReader</Code> there.
          </p>
        </FileExample>
        <FileExample file="app/api/protected/route.ts">
          <p>
            Everywhere else (server components, route handlers, server actions), use <Code>auth.getSession()</Code>. Check
            the session again in protected pages and APIs rather than relying on the proxy alone.
          </p>
        </FileExample>
      </Section>

      <Section id="local" title="6. Run locally">
        <p className="text-gray-300">SAML requires HTTPS, including on localhost. Next.js can serve it for you:</p>
        <CodeBlock code={devScriptCode} filename="package.json" />
        <Bullets
          items={[
            <>
              Set <Code>WEBLOGIN_AUTH_SAML_RETURN_ORIGIN=&quot;https://localhost:3000&quot;</Code>, run <Code>npm run dev</Code>,
              and open <Code>https://localhost:3000</Code>.
            </>,
            <>
              Localhost and deploy previews can share your production registration. See{' '}
              <Link href="/skip-validation" className="text-blue-400 hover:underline">
                Multi-Env Support
              </Link>
              .
            </>,
          ]}
        />
      </Section>

      <Section id="register" title="7. Register in SPDB">
        <Callout tone="warning" title="Generate metadata for your production URL, not localhost">
          <p>
            Metadata downloaded from <Code>https://localhost:3000/api/auth/metadata</Code> has a localhost ACS URL. Registered
            in SPDB, it sends production logins to localhost.
          </p>
        </Callout>
        <article>
          <p className="text-gray-300 mb-3">
            <Code>npm run metadata</Code> builds metadata from the config in step 3 and your current keys. It refuses
            localhost origins and checks the signature before writing anything:
          </p>
          <CodeBlock code={metadataCode} filename="Terminal" />
        </article>
        <Callout title="Use weblogin-auth-sdk 4.1.1 or later">
          <p>
            Earlier versions produce signed metadata with an invalid signature (
            <ExternalLink href="https://github.com/SU-SWS/weblogin-auth-sdk/pull/104">weblogin-auth-sdk#104</ExternalLink>
            ). On those versions <Code>npm run metadata</Code> stops with an explanation instead of writing a broken file.
          </p>
        </Callout>
        <Panel>
          <ol className="list-decimal ml-6 space-y-2">
            <li>
              Create an SP configuration in <ExternalLink href="https://spdb.stanford.edu">SPDB</ExternalLink> with your
              Entity ID, and upload <Code>sp-metadata.xml</Code>.
            </li>
            <li>
              Request the attributes your app needs, such as <Code>uid</Code>, <Code>displayName</Code>, <Code>mail</Code> and{' '}
              <Code>eduPersonAffiliation</Code>.
            </li>
            <li>Wait for the IdP to pick up the configuration before testing logins.</li>
          </ol>
        </Panel>
      </Section>

      <Section id="deploy" title="8. Deploy">
        <FileExample file="netlify.toml">
          <p>
            This site deploys on Netlify and loads its keys from Vault at build time with{' '}
            <Code>netlify-plugin-vault-variables</Code>.
          </p>
        </FileExample>
        <Bullets
          items={[
            <>
              <Code>next.config.ts</Code> inlines <Code>WEBLOGIN_AUTH_SESSION_SECRET</Code> at build time so the edge proxy
              can read sessions. Only reference it from server code.
            </>,
            <>
              Every build runs <Code>npm run check-certs</Code> first. Look for its output in your build log:
            </>,
          ]}
        />
        <CodeBlock code={checkCertsCode} filename="Build log" />
      </Section>

      <Section id="maintain" title="Keep it running">
        <Callout tone="warning" title="Renew your metadata every year">
          <p>
            Generated metadata has a <Code>validUntil</Code> date one year out (change it with <Code>metadataValidityDays</Code>{' '}
            in <Code>lib/saml-config.ts</Code>). <strong>When it passes, SPDB disables your SP
            configuration and logins stop.</strong> Put a reminder in your calendar a few weeks before that date, then run{' '}
            <Code>npm run metadata</Code> again and upload the new file to SPDB.
          </p>
        </Callout>
        <Panel>
          <h3 className="font-semibold text-white mb-3">Rotating certificates</h3>
          <p className="mb-3">
            SPDB pins your certificates, so changing keys in the app without updating SPDB (or the other way round) breaks
            logins. Plan the cutover:
          </p>
          <ol className="list-decimal ml-6 space-y-2">
            <li>
              Generate the new key pair. <Code>npm run certs</Code> writes it to <Code>certificates/</Code> (it won&apos;t
              overwrite keys already in <Code>.env.local</Code>). Store it in your secrets manager, but don&apos;t deploy it
              yet.
            </li>
            <li>
              Put the new keys in <Code>.env.local</Code> and run <Code>npm run metadata</Code>.
            </li>
            <li>Upload the metadata to SPDB, then deploy the new keys right away.</li>
          </ol>
          <p className="mt-3">
            Logins fail between the SPDB update and the deploy finishing, while the IdP uses the new certificate and the site
            still has the old key. Keep that gap short.
          </p>
        </Panel>
        <Bullets
          items={[
            <>
              <Code>check-certs</Code> warns in the build log 60 days before a certificate expires, and if a key doesn&apos;t
              match its certificate. It never fails the build.
            </>,
          ]}
        />
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300 border border-gray-700 rounded-xl overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3">Symptom</th>
                <th className="p-3">Likely cause</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  <><Code>Missing required SAML configuration</Code> at startup or build</>,
                  'An env var is unset, or read before it was available. Check step 2 and the lazy initialization in step 3.',
                ],
                [
                  'Every login fails signature validation',
                  <><Code>idpCert</Code> isn&apos;t set, so the SDK used your SP cert as the IdP cert (step 2).</>,
                ],
                ['Production logins redirect to localhost', 'SPDB has metadata generated on localhost. Regenerate it for production (step 7).'],
                ['Logins stopped after about a year', <>Metadata <Code>validUntil</Code> passed and SPDB disabled the SP. Renew it.</>],
                ['Logins fail right after a key change', 'SPDB metadata and the app’s keys don’t match. Finish the rotation.'],
                [
                  <><Code>npm run metadata</Code> says the signature doesn&apos;t verify</>,
                  'Your SDK is older than 4.1.1 (step 7), or the cert and private key are from different pairs.',
                ],
              ].map(([symptom, cause], i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="p-3 align-top">{symptom}</td>
                  <td className="p-3 align-top">{cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-300">
          More options and APIs are in the{' '}
          <ExternalLink href="https://github.com/SU-SWS/weblogin-auth-sdk/tree/main/docs">SDK documentation</ExternalLink>.
        </p>
      </Section>
    </main>
  );
}
