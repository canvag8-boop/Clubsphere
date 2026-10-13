import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'clubsphere-production-secret-9b2f7c4e-key';

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'coordinator' | 'admin';
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Hash a password using Node.js built-in scrypt with a random 16-byte salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify password against stored hash.
 * Supports legacy plaintext migration safely while migrating to scrypt hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  // If already hashed with salt:key
  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    return new Promise((resolve) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return resolve(false);
        try {
          const keyBuffer = Buffer.from(key, 'hex');
          resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
        } catch {
          resolve(false);
        }
      });
    });
  }

  // Legacy plaintext fallback check
  const inputBuffer = Buffer.from(password);
  const targetBuffer = Buffer.from(storedHash);
  if (inputBuffer.length !== targetBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}

/**
 * Creates an HMAC-SHA256 signed stateless JWT token
 */
export function createToken(payload: AuthUser, expiresInSeconds = 7 * 24 * 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies and decodes token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

/**
 * Authentication Middleware: Enforces valid Bearer token
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.substring(7).trim();
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please sign in again.' });
  }

  req.user = user;
  next();
}

/**
 * Optional Auth Middleware: Populates req.user if token is present
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware
 */
export function requireRole(allowedRoles: Array<'student' | 'coordinator' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. This action requires ${allowedRoles.join(' or ')} privileges.`,
      });
    }
    next();
  };
}
