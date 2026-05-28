import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const publicPaths = ['/login', '/register', '/api/auth'];
const ignoredPrefixes = ['/_next', '/favicon.ico'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ignoredPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    const session = await auth();
    if (session && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/slides', request.url));
    }
    return NextResponse.next();
  }

  const session = await auth();
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/admin')) {
    const role = (session.user as { role?: string })?.role;
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}
