import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('nova-session')?.value;
  if (!token || !(await verifyToken(token))) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/resume/:path*',
    '/interview/:path*',
    '/history/:path*',
  ],
};
