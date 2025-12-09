/**
 * =============================================================================
 * CODE BLOCK COMPONENT - app/components/CodeBlock.tsx
 * =============================================================================
 *
 * A styled code display component with syntax highlighting, line numbers,
 * and a copy-to-clipboard button. Used to show code examples throughout
 * the demo application.
 *
 * FEATURES:
 * - macOS-style window header with red/yellow/green dots
 * - Filename display
 * - Line numbers
 * - Basic syntax highlighting for TypeScript/JavaScript
 * - Copy button with visual feedback
 *
 * CLIENT COMPONENT:
 * This uses 'use client' because it needs useState for the copy button
 * feedback. The highlighting is done client-side for simplicity.
 *
 * USAGE:
 * ```tsx
 * <CodeBlock
 *   code={`const x = 1;\nconsole.log(x);`}
 *   filename="example.ts"
 * />
 * ```
 *
 * NOTE ON SYNTAX HIGHLIGHTING:
 * This uses simple regex-based highlighting for demonstration purposes.
 * For production apps, consider using a library like:
 * - Prism.js (https://prismjs.com)
 * - highlight.js (https://highlightjs.org)
 * - Shiki (https://shiki.matsu.io)
 * =============================================================================
 */

'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;        // The code to display
  filename?: string;   // Optional filename shown in header
}

export default function CodeBlock({ code, filename }: CodeBlockProps) {
  // Track copy state for button feedback
  const [copied, setCopied] = useState(false);

  /**
   * Copy code to clipboard and show feedback
   * Uses the modern Clipboard API (supported in all modern browsers)
   */
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    // Reset the "copied" state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Apply basic syntax highlighting using regex replacements.
   * Each pattern matches a syntax element and wraps it in a colored span.
   *
   * COLORS USED:
   * - Purple: Keywords (import, export, const, function, etc.)
   * - Green: Strings ('...', "...", `...`)
   * - Yellow: Types (interface, type, NextRequest, etc.)
   * - Blue: Function calls (getSession, redirect, etc.)
   * - Cyan: Object properties (saml:, session:, etc.)
   * - Orange: Booleans and null
   * - Red: Environment variables (process.env.*)
   */
  const highlightCode = (code: string) => {
    return code
      // Strings - matches single, double, and template literal strings
      .replace(/(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g, '<span class="text-green-400">$1$2$3</span>')
      // Keywords - JavaScript/TypeScript reserved words
      .replace(/\b(import|export|from|const|let|var|function|async|await|return|if|else|new|throw|try|catch|default)\b/g, '<span class="text-purple-400">$1</span>')
      // Types and interfaces
      .replace(/\b(type|interface|Session|NextRequest|NextResponse|URL|Response)\b/g, '<span class="text-yellow-400">$1</span>')
      // Function/method calls
      .replace(/\b(createWebLoginNext|getSession|startsWith|redirect|next|set)\b(?=\()/g, '<span class="text-blue-400">$1</span>')
      // Object properties (followed by : or ?.)
      .replace(/\b(saml|session|issuer|entryPoint|idpCert|returnToOrigin|privateKey|cert|decryptionPvk|decryptionCert|name|secret|cookie|secure|matcher|pathname|nextUrl|url|searchParams|user)\b(?=:|\?\.)/g, '<span class="text-cyan-400">$1</span>')
      // Booleans and null
      .replace(/\b(true|false|null)\b/g, '<span class="text-orange-400">$1</span>')
      // Environment variables
      .replace(/(process\.env\.[A-Z_]+!?)/g, '<span class="text-red-400">$1</span>');
  };

  // Split code into lines for line number display
  const lines = code.split('\n');

  return (
    <div className="relative group rounded-lg overflow-hidden bg-gray-950 border border-gray-700">
      {/* macOS-style window header */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-2">
            {/* Traffic light buttons (decorative) */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            {/* Filename */}
            <span className="text-gray-400 text-sm font-mono ml-2">{filename}</span>
          </div>

          {/* Copy button */}
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              // Checkmark icon when copied
              <>
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              // Copy icon by default
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Code content with line numbers */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="hover:bg-gray-900/50">
                {/* Line number column */}
                <td className="pl-4 pr-4 py-0 text-right text-gray-600 select-none font-mono text-sm border-r border-gray-800 w-12">
                  {index + 1}
                </td>
                {/* Code line with syntax highlighting */}
                <td className="pl-4 pr-4 py-0">
                  <pre className="font-mono text-sm">
                    <code
                      className="text-gray-300"
                      // Using dangerouslySetInnerHTML for highlighted HTML
                      // This is safe because we control the input (no user input)
                      dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }}
                    />
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
