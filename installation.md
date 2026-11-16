# Weblogin Auth SDK Installation Guide (Next.js)

The full implementation guide is a page on the example site:

**https://weblogin-auth-example.netlify.app/guide** (source: [app/guide/page.tsx](app/guide/page.tsx))

Its code samples are read from this repo's files when the page renders, so they always match the working code. Run `npm run dev` and open https://localhost:3000/guide to read it locally.

## Checklist

1. **Prerequisites:** Next.js 16 (App Router), Node.js 20.9+, access to [SPDB](https://spdb.stanford.edu), and `npm install weblogin-auth-sdk@^3`.
2. **Keys:** a signing key pair (required) and optionally an encryption pair. Generate them for 10 years: `openssl req -x509 -newkey rsa:2048 -nodes -days 3650 ...`, or `npm run certs` in this repo.
3. **Environment variables:** see the guide. Always set `idpCert` explicitly: without it the SDK reads the IdP cert from `WEBLOGIN_AUTH_SAML_CERT`, which here holds the SP cert.
4. **Configure the SDK:** [lib/saml-config.ts](lib/saml-config.ts) and [lib/auth.ts](lib/auth.ts) (lazy initialization).
5. **Auth routes:** [login](app/api/auth/login/route.ts), [callback](app/api/auth/callback/route.ts), [logout](app/api/auth/logout/route.ts), [metadata](app/api/auth/metadata/route.ts).
6. **Protect routes:** [proxy.ts](proxy.ts) (edge session reader) plus checks in pages and [API routes](app/api/protected/route.ts).
7. **Run locally over HTTPS:** `next dev --experimental-https`, return origin `https://localhost:3000`.
8. **Register in SPDB:** `npm run metadata -- --origin https://your-app.stanford.edu` ([scripts/generate-metadata.mjs](scripts/generate-metadata.mjs)). Never register metadata generated on localhost.
9. **Deploy:** [netlify.toml](netlify.toml) loads keys from Vault. `npm run check-certs` runs before every build.
10. **Keep it running:** renew metadata in SPDB before its `validUntil` date (one year out), and follow the guide's cutover order when rotating certificates.
