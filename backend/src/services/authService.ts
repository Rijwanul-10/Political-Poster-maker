import bcrypt from 'bcryptjs';

/**
 * Hash a plain‑text password.
 * Uses 10 salt rounds – sufficient for dev/MVP.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain‑text password with a stored hash.
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
