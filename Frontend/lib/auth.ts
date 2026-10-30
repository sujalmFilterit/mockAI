import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.NODE_ENV === 'production')
    throw new Error('AUTH_SECRET must be configured for production');
  return new TextEncoder().encode(
    value || 'nova-local-development-secret-at-least-32-characters',
  );
};
export async function signToken(id: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}
export async function verifyToken(token: string) {
  try {
    return (await jwtVerify(token, secret())).payload.sub ?? null;
  } catch {
    return null;
  }
}
export async function currentUserId() {
  const token = cookies().get('nova-session')?.value;
  return token ? verifyToken(token) : null;
}
