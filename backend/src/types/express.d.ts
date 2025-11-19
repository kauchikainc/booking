import { JwtPayload } from '../utils/jwt';

/**
 * Expressのリクエスト型を拡張
 * 認証ミドルウェアでユーザー情報を追加できるようにする
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
