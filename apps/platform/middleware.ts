import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const publicPaths = ['/login', '/register', '/api/auth'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!req.auth && !isPublic) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/slides', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
