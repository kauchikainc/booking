import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import logger from '../utils/logger';

/**
 * 一般利用者登録
 * POST /api/v1/auth/register/guest
 */
export async function registerGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const result = await authService.registerGuest({
      email,
      password,
      firstName,
      lastName,
    });

    logger.info('一般利用者が登録されました', { email });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 施設オーナー登録
 * POST /api/v1/auth/register/owner
 */
export async function registerOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, companyName, businessLicense, phone, invitationToken } = req.body;

    const result = await authService.registerOwner({
      email,
      password,
      companyName,
      businessLicense,
      phone,
      invitationToken,
    });

    logger.info('施設オーナーが登録されました', { email, companyName });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ログイン
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    logger.info('ユーザーがログインしました', { email });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 現在のユーザー情報を取得
 * GET /api/v1/auth/me
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      });
      return;
    }

    const user = await authService.getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ログアウト
 * POST /api/v1/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    // JWTはステートレスなので、サーバー側では何もしない
    // クライアント側でトークンを削除する

    logger.info('ユーザーがログアウトしました', { userId: req.user?.userId });

    res.status(200).json({
      success: true,
      data: {
        message: 'ログアウトしました',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * プロフィールを更新
 * PUT /api/v1/auth/profile
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      });
      return;
    }

    const user = await authService.updateProfile(req.user.userId, req.body);

    logger.info('プロフィールが更新されました', { userId: req.user.userId });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * パスワードを変更
 * PUT /api/v1/auth/password
 */
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.userId, {
      currentPassword,
      newPassword,
    });

    logger.info('パスワードが変更されました', { userId: req.user.userId });

    res.status(200).json({
      success: true,
      data: {
        message: 'パスワードを変更しました',
      },
    });
  } catch (error) {
    next(error);
  }
}
