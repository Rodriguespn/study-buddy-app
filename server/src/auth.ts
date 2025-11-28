import { AsyncLocalStorage } from "node:async_hooks";

import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";

import { env } from "./env.js";

/**
 * User context extracted from validated JWT token
 */
export interface AuthContext {
  /** User ID from the JWT 'sub' claim */
  userId: string;
  /** OAuth client ID (null for direct user sessions) */
  clientId: string | null;
  /** User's email (if available) */
  email?: string;
  /** Raw access token for Supabase client authentication */
  accessToken: string;
}

/**
 * AsyncLocalStorage for passing auth context through the request lifecycle.
 * This allows handlers to access the authenticated user without explicit parameter passing.
 */
export const authStorage = new AsyncLocalStorage<AuthContext>();

/**
 * Get the current auth context from AsyncLocalStorage.
 * @throws Error if called outside of an authenticated request context
 */
export function getAuthContext(): AuthContext {
  const context = authStorage.getStore();
  if (!context) {
    throw new Error("No auth context available - called outside authenticated request");
  }
  return context;
}

/**
 * Supabase JWT payload structure
 */
interface SupabaseJWTPayload extends JWTPayload {
  sub: string;
  email?: string;
  client_id?: string;
  role?: string;
  aal?: string;
  session_id?: string;
}

/**
 * Get the JWKS (JSON Web Key Set) for token validation.
 * Supabase OAuth 2.1 tokens should be signed with asymmetric keys (ES256)
 * and verified via the JWKS endpoint.
 *
 * Note: If your Supabase project uses legacy HS256 signing, you need to
 * migrate to asymmetric keys in Supabase Dashboard > Settings > JWT Signing Keys.
 *
 * We create a fresh JWKS instance each time to avoid caching issues during
 * key rotation. The jose library handles HTTP-level caching internally.
 */
function getJWKS() {
  const jwksUrl = new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
  return createRemoteJWKSet(jwksUrl);
}

/**
 * Validate a JWT access token and extract user context.
 *
 * @param token - The Bearer token from the Authorization header
 * @returns AuthContext with user information
 * @throws Error if token is invalid, expired, or has wrong issuer/audience
 */
export async function validateToken(token: string): Promise<AuthContext> {
  try {
    const { payload } = await jwtVerify<SupabaseJWTPayload>(token, getJWKS(), {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      // Supabase tokens use 'authenticated' as audience
      audience: "authenticated",
    });

    if (!payload.sub) {
      throw new Error("Token missing 'sub' claim");
    }

    return {
      userId: payload.sub,
      clientId: payload.client_id ?? null,
      email: payload.email,
      accessToken: token,
    };
  } catch (error) {
    // Log detailed error for debugging
    console.error("Token validation failed:", error);
    console.error("Expected issuer:", `${env.SUPABASE_URL}/auth/v1`);
    const jwksUrl = `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
    console.error("JWKS URL:", jwksUrl);

    // Decode token header to see algorithm and key ID
    try {
      const [headerB64] = token.split(".");
      const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
      console.error("Token header:", header);

      if (header.alg === "HS256") {
        console.error(
          "Note: Token uses HS256. You need to migrate to asymmetric keys in Supabase Dashboard"
        );
      } else {
        // Fetch JWKS to show available keys for comparison
        try {
          const jwksResponse = await fetch(jwksUrl);
          const jwks = await jwksResponse.json();
          const availableKids = jwks.keys?.map((k: { kid: string }) => k.kid) || [];
          console.error("Token expects kid:", header.kid);
          console.error("JWKS has kids:", availableKids);
          if (!availableKids.includes(header.kid)) {
            console.error(
              "Key mismatch! The token was signed with a key not in JWKS. " +
                "This may be a propagation delay - wait a few minutes and try again."
            );
          }
        } catch {
          // ignore fetch errors
        }
      }
    } catch {
      // ignore decode errors
    }
    throw error;
  }
}

/**
 * Extract Bearer token from Authorization header.
 *
 * @param authHeader - The Authorization header value
 * @returns The token string or null if not a valid Bearer token
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Generate the WWW-Authenticate header value for 401 responses.
 * This header tells MCP clients where to find the OAuth server.
 */
export function getWWWAuthenticateHeader(error?: string, errorDescription?: string): string {
  const resourceMetadataUrl = `${env.MCP_SERVER_URL}/.well-known/oauth-protected-resource`;
  let header = `Bearer resource_metadata="${resourceMetadataUrl}"`;

  if (error) {
    header += `, error="${error}"`;
    if (errorDescription) {
      header += `, error_description="${errorDescription}"`;
    }
  }

  return header;
}
