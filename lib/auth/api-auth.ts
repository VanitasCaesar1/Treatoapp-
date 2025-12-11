/*
 * API Route Auth Helper
 *
 * This module handles authentication for Next.js API routes.
 * It extracts access tokens from requests and creates headers
 * for backend calls.
 *
 * Why not verify tokens here?
 * The backend does full JWT verification. We just extract and
 * forward the token. This keeps the frontend simple and ensures
 * all auth logic is in one place (the backend).
 *
 * Token sources (in order of priority):
 * 1. Authorization header - mobile apps send tokens here
 * 2. Custom access_token cookie - password/magic link auth
 * 3. WorkOS AuthKit session - OAuth login
 *
 * Usage:
 *   const { accessToken } = await withAuth(req);
 *   if (!accessToken) return unauthorized();
 *   const response = await fetch(backend, { headers: createBackendHeaders(accessToken) });
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { withAuth as workosWithAuth } from '@workos-inc/authkit-nextjs';

export interface UserInfo {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface AuthResult {
    accessToken: string | null;
    user: UserInfo | null;
}

/*
 * withAuth - Extract auth from request
 *
 * Checks multiple sources for authentication:
 * 1. Authorization header (mobile apps)
 * 2. Custom access_token cookie (password/magic link login)
 * 3. WorkOS AuthKit session (OAuth login)
 */
export async function withAuth(req: NextRequest, options?: { ensureSignedIn?: boolean }): Promise<AuthResult> {
    /*
     * Priority 1: Authorization header
     * Mobile apps and API clients send tokens here.
     */
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const user = extractUserFromToken(token);
        return { accessToken: token, user };
    }

    /*
     * Priority 2: Custom access_token cookie
     * Set by password/magic link login routes.
     */
    const cookieStore = await cookies();
    const tokenFromCookie = cookieStore.get('access_token')?.value;
    
    if (tokenFromCookie) {
        const user = extractUserFromToken(tokenFromCookie);
        return { accessToken: tokenFromCookie, user };
    }

    /*
     * Priority 3: WorkOS AuthKit session
     * Set by OAuth login (Google, etc.)
     */
    try {
        const { user: workosUser, accessToken: workosToken } = await workosWithAuth();
        if (workosUser && workosToken) {
            return {
                accessToken: workosToken,
                user: {
                    id: workosUser.id,
                    email: workosUser.email || undefined,
                    firstName: workosUser.firstName || undefined,
                    lastName: workosUser.lastName || undefined,
                },
            };
        }
    } catch (error) {
        // WorkOS session not available, continue
    }

    /* No auth found - caller should return 401 */
    return { accessToken: null, user: null };
}

/*
 * extractUserFromToken - Decode JWT payload (no verification)
 *
 * JWTs are base64-encoded JSON. We can read the payload without
 * the secret key. This is NOT a security check - anyone can
 * create a JWT with any payload. The backend verifies the signature.
 *
 * We use this for:
 * - Logging (who made this request?)
 * - Passing user context to backend
 * - UI display (show user name)
 */
function extractUserFromToken(token: string): UserInfo | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(atob(parts[1]));
        return {
            id: payload.sub || payload.user_id || payload.id || '',
            email: payload.email,
            firstName: payload.first_name || payload.firstName,
            lastName: payload.last_name || payload.lastName,
        };
    } catch {
        return null;
    }
}

/*
 * createBackendHeaders - Build headers for backend API calls
 *
 * Creates a standard set of headers for calling the Go backend.
 * The Authorization header carries the JWT for authentication.
 * X-Auth-ID is optional context (backend should verify token, not trust this).
 */
export function createBackendHeaders(accessToken: string, userId?: string): HeadersInit {
    const headers: HeadersInit = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    
    if (userId) {
        headers['X-Auth-ID'] = userId;
    }
    
    return headers;
}
