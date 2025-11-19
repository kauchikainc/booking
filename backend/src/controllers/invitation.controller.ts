import { Request, Response, NextFunction } from 'express';
import invitationService from '../services/invitation.service';
import logger from '../utils/logger';
import { Role, InvitationStatus } from '@prisma/client';

/**
 * 招待を作成
 * POST /api/v1/admin/invitations
 */
export async function createInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    // 管理者のみ実行可能
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'この操作を実行する権限がありません',
        },
      });
      return;
    }

    const { email, role, expiresInDays } = req.body;

    // ロールの検証
    if (role !== 'OWNER' && role !== 'ADMIN') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'ロールはOWNERまたはADMINである必要があります',
        },
      });
      return;
    }

    const invitation = await invitationService.createInvitation(
      email,
      role as Role,
      req.user.userId,
      expiresInDays
    );

    logger.info('招待が作成されました', {
      invitationId: invitation.id,
      email,
      role,
      invitedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: { invitation },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 招待トークンを検証
 * GET /api/v1/invitations/validate/:token
 */
export async function validateInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.params;

    const invitation = await invitationService.validateInvitationToken(token);

    if (!invitation) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '無効な招待トークンです',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        invitation: {
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 招待一覧を取得（管理者用）
 * GET /api/v1/admin/invitations
 */
export async function getInvitations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    // 管理者のみ実行可能
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'この操作を実行する権限がありません',
        },
      });
      return;
    }

    const { status, page = '1', limit = '20' } = req.query;

    const result = await invitationService.getInvitations(
      undefined,
      status as InvitationStatus | undefined,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 招待を削除（管理者用）
 * DELETE /api/v1/admin/invitations/:id
 */
export async function deleteInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    // 管理者のみ実行可能
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'この操作を実行する権限がありません',
        },
      });
      return;
    }

    const { id } = req.params;

    await invitationService.deleteInvitation(id);

    logger.info('招待が削除されました', {
      invitationId: id,
      deletedBy: req.user.userId,
    });

    res.status(200).json({
      success: true,
      data: {
        message: '招待を削除しました',
      },
    });
  } catch (error) {
    next(error);
  }
}
