'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  filename?: string;
}

export default function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    return code
      // Comments
      // .replace(/(\/\/.*$)/gm, `<span class="text-gray-500">$1</span>`)
      // Strings
      .replace(/(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g, '<span class="text-green-400">$1$2$3</span>')
      // Keywords
      .replace(/\b(import|export|from|const|let|var|function|async|await|return|if|else|new|throw|try|catch|default)\b/g, '<span class="text-purple-400">$1</span>')
      // Types and interfaces
      .replace(/\b(type|interface|Session|NextRequest|NextResponse|URL|Response)\b/g, '<span class="text-yellow-400">$1</span>')
      // Functions/methods
      .replace(/\b(createWebLoginNext|getSession|startsWith|redirect|next|set)\b(?=\()/g, '<span class="text-blue-400">$1</span>')
      // Properties
      .replace(/\b(saml|session|issuer|entryPoint|idpCert|returnToOrigin|privateKey|cert|decryptionPvk|decryptionCert|name|secret|cookie|secure|matcher|pathname|nextUrl|url|searchParams|user)\b(?=:|\?\.)/g, '<span class="text-cyan-400">$1</span>')
      // Booleans and null
      .replace(/\b(true|false|null)\b/g, '<span class="text-orange-400">$1</span>')
      // process.env
      .replace(/(process\.env\.[A-Z_]+!?)/g, '<span class="text-red-400">$1</span>');
  };

  const lines = code.split('\n');

  return (
    <div className="relative group rounded-lg overflow-hidden bg-gray-950 border border-gray-700">
      {/* Header */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-gray-400 text-sm font-mono ml-2">{filename}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
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

      {/* Code content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="hover:bg-gray-900/50">
                <td className="pl-4 pr-4 py-0 text-right text-gray-600 select-none font-mono text-sm border-r border-gray-800 w-12">
                  {index + 1}
                </td>
                <td className="pl-4 pr-4 py-0">
                  <pre className="font-mono text-sm">
                    <code
                      className="text-gray-300"
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
