import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      '/',
      '/login',
      '/register',
      '/callback',
      '/auth/error',
      '/api/public/:path*',
    ],
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/appointments/:path*',
    '/doctors/:path*',
    '/medical-records/:path*',
    '/video/:path*',
    '/community/:path*',
    '/medicines/:path*',
    '/templates/:path*',
    '/api/user/:path*',
    '/api/protected/:path*',
    '/callback',
    '/',
    '/login',
    '/register',
  ],
};
