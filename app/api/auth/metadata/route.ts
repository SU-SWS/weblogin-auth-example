import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { idps } from 'weblogin-auth-sdk';

export async function GET() {
  try {
    const metadata = auth.getMetadata(process.env.WEBLOGIN_AUTH_SAML_DECRYPTION_KEY, idps.prod.cert);
    return new NextResponse(metadata, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
}
