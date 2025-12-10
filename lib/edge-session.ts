/**
 * =============================================================================
 * EDGE SESSION UTILITIES - lib/edge-session.ts
 * =============================================================================
 *
 * Provides edge-compatible session validation utilities for use in middleware
 * and edge functions. This module uses only Web APIs and has no Node.js
 * dependencies, making it safe to use in edge runtime environments.
 *
 * FEATURES:
 * - Lightweight session validation using Web Crypto APIs
 * - Iron-session compatible decryption
 * - Framework agnostic - works with any edge function platform
 *
 * @see https://github.com/SU-SWS/weblogin-auth-sdk/blob/main/docs/edge-functions.md
 * =============================================================================
 */

import {
  createEdgeSessionReader,
  type EdgeSessionReader,
} from 'weblogin-auth-sdk/edge-session';

// Cached instance to avoid recreating on every call
let cachedReader: EdgeSessionReader | null = null;

/**
 * Get the session secret from the environment.
 * Supports both Node.js (process.env) and Netlify Edge (Netlify.env).
 */
function getSessionSecret(): string {
  // Try Netlify Edge environment first (runtime)
  // @ts-expect-error - Netlify global is available in Netlify Edge Functions
  if (typeof Netlify !== 'undefined' && Netlify.env) {
    // @ts-expect-error - Netlify global is available in Netlify Edge Functions
    const secret = Netlify.env.get('WEBLOGIN_AUTH_SESSION_SECRET');
    console.log('Using Netlify Edge session secret', secret?.slice(0, 4) + '...');
    if (secret) return secret;
  }

  // Fall back to process.env (Node.js / local dev)
  if (process.env.WEBLOGIN_AUTH_SESSION_SECRET) {
    console.log('Using process.env session secret', process.env.WEBLOGIN_AUTH_SESSION_SECRET?.slice(0, 4) + '...');
    return process.env.WEBLOGIN_AUTH_SESSION_SECRET;
  }

  throw new Error(
    'Session secret is required. Set WEBLOGIN_AUTH_SESSION_SECRET environment variable.'
  );
}

/**
 * Get the edge session reader instance.
 *
 * This function lazily creates the reader on first call to avoid
 * issues with environment variables not being available at build time.
 *
 * USAGE:
 * ```ts
 * import { getEdgeSessionReader } from '@/lib/edge-session';
 *
 * const sessionReader = getEdgeSessionReader();
 * const isAuthenticated = await sessionReader.isAuthenticated(request);
 * const user = await sessionReader.getUser(request);
 * const userId = await sessionReader.getUserId(request);
 * ```
 */
export function getEdgeSessionReader(): EdgeSessionReader {
  if (!cachedReader) {
    cachedReader = createEdgeSessionReader(
      getSessionSecret(),
      'weblogin-auth' // cookie name
    );
  }
  return cachedReader;
}
