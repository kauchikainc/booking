import bcrypt from 'bcrypt';

/**
 * パスワードハッシュ化のコスト係数
 * 値が大きいほど安全だが処理時間が増える（推奨: 10-12）
 */
const SALT_ROUNDS = 12;

/**
 * パスワードをハッシュ化
 * @param password - 平文パスワード
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * パスワードを検証
 * @param password - 平文パスワード
 * @param hashedPassword - ハッシュ化されたパスワード
 * @returns パスワードが一致する場合true
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
