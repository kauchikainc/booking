import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './error-handler';
import logger from '../utils/logger';

/**
 * JWT認証ミドルウェア
 * Authorizationヘッダーからトークンを取得し、検証する
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    // Authorizationヘッダーを取得
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, '認証トークンが提供されていません');
    }

    // "Bearer {token}" 形式を想定
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError(401, '認証トークンの形式が不正です');
    }

    const token = parts[1];

    // トークンを検証
    const payload = verifyToken(token);

    // リクエストオブジェクトにユーザー情報を追加
    req.user = payload;

    logger.debug('ユーザーが認証されました', { userId: payload.userId, role: payload.role });

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    // JWT検証エラー（期限切れ、不正なトークンなど）
    logger.warn('JWT検証エラー', { error });
    return next(new AppError(401, '認証トークンが無効または期限切れです'));
  }
}

/**
 * ロール認可ミドルウェア
 * 特定のロールを持つユーザーのみアクセスを許可する
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, '認証が必要です'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('権限不足', {
        userId: req.user.userId,
        requiredRoles: allowedRoles,
        actualRole: req.user.role,
      });
      return next(new AppError(403, 'この操作を実行する権限がありません'));
    }

    next();
  };
}
