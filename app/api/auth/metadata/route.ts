import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const metadata = auth.getMetadata();
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
