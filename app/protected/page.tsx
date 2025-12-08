import { auth } from '@/lib/auth';
import { type Session } from 'weblogin-auth-sdk';

export default async function ProtectedPage() {
  const session: Session | null = await auth.getSession();

  if (!session || !session.user || !session.user.name) {
    // Access denied, return 403, but this should be handled by middleware by this point.
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be logged in to view this page.</p>
        <a href="/api/auth/login" className="text-blue-500 underline">
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Protected Page</h1>
      <p className="mb-4">This page is protected by middleware. Only authenticated users can see this.</p>
      <div className="bg-gray-100 p-4 rounded">
        <p>Welcome, {session?.user?.name || session?.user?.userName}!</p>
      </div>
    </div>
  );
}
