// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth, request) => {
  // Allow webhook to pass through without authentication
  if (request.nextUrl.pathname === '/api/webhook/clerk') {
    return;
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};