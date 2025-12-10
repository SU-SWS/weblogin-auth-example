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

import 'server-only';
import { createEdgeSessionReader } from 'weblogin-auth-sdk/edge-session';

/**
 * Pre-configured edge session reader instance.
 *
 * This reader is configured with the session secret from environment variables
 * and can be used to validate sessions in edge functions and middleware.
 *
 * USAGE:
 * ```ts
 * import { edgeSessionReader } from '@/lib/edge-session';
 *
 * const isAuthenticated = await edgeSessionReader.isAuthenticated(request);
 * const user = await edgeSessionReader.getUser(request);
 * const userId = await edgeSessionReader.getUserId(request);
 * ```
 */
export const edgeSessionReader = createEdgeSessionReader(
  process.env.WEBLOGIN_AUTH_SESSION_SECRET!,
  'weblogin-auth' // cookie name
);
