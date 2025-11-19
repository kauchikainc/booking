import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator/lib/validation-result';
import { ValidationChain } from 'express-validator/lib/chain';
import { AppError } from './error-handler';

/**
 * バリデーション結果をチェックするミドルウェア
 */
export function validate(req: Request, _res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }));

    const error = new AppError(422, 'バリデーションエラー', true);
    (error as any).details = errorMessages;
    return next(error);
  }

  next();
}

/**
 * バリデーションチェーンを実行するミドルウェアを作成
 */
export function validateRequest(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // すべてのバリデーションを実行
    await Promise.all(validations.map((validation) => validation.run(req)));

    // バリデーション結果をチェック
    validate(req, res, next);
  };
}
