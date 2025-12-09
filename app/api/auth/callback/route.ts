import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const { returnTo, user, session } = await auth.authenticate(request);

  // You can use the user and session objects as needed here
  // console.log('Authenticated user:', user);
  // console.log('Session data:', session);

  const redirectUrl = returnTo || '/session';
  return Response.redirect(new URL(redirectUrl, request.url));
}
