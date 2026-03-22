import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/admin-auth';

export async function validateAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  return validateSessionToken(session?.value, adminPassword);
}
