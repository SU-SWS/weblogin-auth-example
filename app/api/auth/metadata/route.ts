/**
 * =============================================================================
 * METADATA ROUTE - /api/auth/metadata
 * =============================================================================
 *
 * This endpoint serves your Service Provider (SP) metadata XML. This metadata
 * is required to register your application with Stanford IT.
 *
 * WHAT IS SP METADATA?
 * An XML document that describes your Service Provider, including:
 * - Entity ID: Unique identifier for your SP
 * - ACS URL: Where to send SAML responses (callback endpoint)
 * - Signing certificate: For validating requests from your SP
 * - Encryption certificate: For encrypting SAML assertions to your SP
 * - Name ID format: How you want user identifiers formatted
 *
 * HOW TO USE:
 * 1. Deploy your application
 * 2. Visit /api/auth/metadata to see/download the XML
 * 3. Submit this metadata to Stanford IT for registration
 * 4. Stanford IT will configure their IdP to trust your SP
 *
 * REGISTRATION PROCESS:
 * Contact Stanford IT (itservices.stanford.edu) to register your SP.
 * They will need:
 * - Your SP metadata XML (from this endpoint)
 * - Information about your application
 * - Justification for the attributes you need
 *
 * @see https://uit.stanford.edu/service/saml for Stanford SAML docs
 * =============================================================================
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Generate the SP metadata XML from the SDK configuration
    // This includes all the certificates and endpoints from lib/auth.ts
    const metadata = auth.getMetadata();

    // Return as XML with proper content type
    // Browsers will display/download this as an XML file
    return new NextResponse(metadata, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    // Log error for debugging - metadata generation can fail if
    // certificates are malformed or configuration is incomplete
    console.error('Error generating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
}
