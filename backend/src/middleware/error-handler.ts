import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * グローバルエラーハンドラー
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // デフォルトは500エラー
  let statusCode = 500;
  let message = 'サーバー内部エラーが発生しました';
  let isOperational = false;

  // AppErrorの場合
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // エラーログを記録
  logger.error('エラーが発生しました', {
    statusCode,
    message: err.message,
    stack: err.stack,
    isOperational,
  });

  // レスポンスを返す
  res.status(statusCode).json({
    success: false,
    error: {
      code: 'ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

/**
 * 404エラーハンドラー
 */
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'リクエストされたリソースが見つかりません'));
}
