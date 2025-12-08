import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const { returnTo } = await auth.authenticate(request);
  const redirectUrl = returnTo || '/session';
  return Response.redirect(new URL(redirectUrl, request.url));
}
