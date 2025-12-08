import { auth } from '@/lib/auth';

export async function POST() {
  await auth.logout();
  return Response.redirect('/');
}
