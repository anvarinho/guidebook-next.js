import 'server-only';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authOptions, requireAuthConfiguration, sessionCookieName } from '@/app/admin/lib/auth';
import { revokeAdminSession } from '@/app/admin/lib/sessions';

export async function requireAdmin() {
  requireAuthConfiguration();
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.isAdmin !== true || session.user.isActive !== true) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function isAuthenticatedAdmin() {
  try { await requireAdmin(); return true; } catch { return false; }
}

export async function signOut() {
  'use server';
  requireAuthConfiguration();
  const store = await cookies();
  const token = await getToken({
    // getToken only reads cookies from this minimal request shape.
    req: { cookies: Object.fromEntries(store.getAll().map(({ name, value }) => [name, value])), headers: {} } as unknown as Parameters<typeof getToken>[0]['req'],
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionCookieName,
  });
  // Revoke before clearing. A DB failure must not report a successful logout.
  await revokeAdminSession(token);
  for (const { name } of store.getAll()) {
    if (name === sessionCookieName || name.startsWith(`${sessionCookieName}.`) || ['token', 'userID', 'isAdmin'].includes(name)) store.delete(name);
  }
  redirect('/login');
}