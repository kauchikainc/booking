import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * JWTペイロード型定義
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * JWTトークンを生成
 * @param payload - トークンに含めるデータ
 * @returns JWTトークン
 */
export function generateToken(payload: JwtPayload): string {
  // @ts-expect-error - jsonwebtokenの型定義の問題を回避
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * JWTトークンを検証
 * @param token - 検証するトークン
 * @returns デコードされたペイロード
 * @throws トークンが無効な場合
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

/**
 * JWTトークンをデコード（検証なし）
 * @param token - デコードするトークン
 * @returns デコードされたペイロード（検証なし）
 */
export function decodeToken(token: string): JwtPayload | null {
  const decoded = jwt.decode(token);
  return decoded as JwtPayload | null;
}
