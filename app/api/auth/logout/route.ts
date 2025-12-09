import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  await auth.logout();
  const url = new URL('/', request.url);
  return Response.redirect(url);
}
