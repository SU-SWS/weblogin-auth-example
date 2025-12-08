import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export default async function SessionPage() {
  const session = await auth.getSession();

  async function updateSession(formData: FormData) {
    'use server';
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;

    if (key && value) {
      await auth.updateSession({
        meta: {
          [key]: value
        }
      });
      revalidatePath('/session');
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Information</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Current Session Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add to Session</h2>
        <form action={updateSession} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Key</label>
            <input name="key" type="text" className="border p-2 rounded text-black" placeholder="e.g. theme" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input name="value" type="text" className="border p-2 rounded text-black" placeholder="e.g. dark" />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Update Session
          </button>
        </form>
      </div>
    </div>
  );
}
