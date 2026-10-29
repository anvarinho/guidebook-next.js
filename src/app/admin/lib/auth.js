import 'server-only';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createAdminSession, validateAdminSession, revokeAdminSession } from './sessions';

export const SESSION_MAX_AGE = 8 * 60 * 60;
export const secureCookies = process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.startsWith('https://') === true;
export const sessionCookieName = secureCookies ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

export function requireAuthConfiguration() {
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
    throw new Error('Authentication is not configured');
  }
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL?.startsWith('https://')) {
    throw new Error('Authentication requires an HTTPS NEXTAUTH_URL');
  }
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: secureCookies,
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE },
  jwt: { maxAge: SESSION_MAX_AGE },
  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: secureCookies, maxAge: SESSION_MAX_AGE },
    },
  },
  providers: [CredentialsProvider({
    name: 'Credentials',
    credentials: { email: { type: 'email' }, password: { type: 'password' } },
    async authorize(credentials) {
      try {
        requireAuthConfiguration();
        return await createAdminSession(credentials);
      } catch {
        // NextAuth includes thrown authorize messages in redirects. Keep failures generic.
        return null;
      }
    },
  })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) return { sub: user.id, sid: user.sid };
      return token;
    },
    async session({ session, token }) {
      const user = await validateAdminSession(token);
      if (!user) return null;
      return { expires: session.expires, user };
    },
  },
  events: {
    async signOut({ token }) { await revokeAdminSession(token); },
  },
  // NextAuth errors can contain provider/adapter data. Never log that data.
  logger: { error() {}, warn() {}, debug() {} },
  debug: false,
};