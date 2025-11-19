import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import logger from '../utils/logger';

/**
 * ユーザー一覧を取得（管理者専用）
 * GET /api/v1/admin/users
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as 'GUEST' | 'OWNER' | 'ADMIN' | undefined;
    const status = req.query.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined;
    const search = req.query.search as string | undefined;

    const result = await adminService.getUsers(page, limit, role, status, search);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('ユーザー一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'ユーザー一覧の取得に失敗しました',
      },
    });
  }
}

/**
 * ユーザーステータスを更新（管理者専用）
 * PUT /api/v1/admin/users/:id/status
 */
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await adminService.updateUserStatus(id, status);

    res.status(200).json({
      success: true,
      data: {
        message: 'ユーザーステータスを更新しました',
      },
    });
  } catch (error) {
    logger.error('ユーザーステータス更新エラー:', error);
    if (error instanceof Error && error.message === 'ユーザーが見つかりません') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'ユーザーステータスの更新に失敗しました',
        },
      });
    }
  }
}

/**
 * 全施設一覧を取得（管理者専用）
 * GET /api/v1/admin/properties
 */
export async function getProperties(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'CLOSED' | undefined;

    const result = await adminService.getProperties(page, limit, status);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('施設一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '施設一覧の取得に失敗しました',
      },
    });
  }
}

/**
 * 施設を承認（管理者専用）
 * PUT /api/v1/admin/properties/:id/approve
 */
export async function approveProperty(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await adminService.approveProperty(id);

    res.status(200).json({
      success: true,
      data: {
        message: '施設を承認しました',
      },
    });
  } catch (error) {
    logger.error('施設承認エラー:', error);
    if (error instanceof Error && error.message === '施設が見つかりません') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '施設の承認に失敗しました',
        },
      });
    }
  }
}

/**
 * 施設を却下（管理者専用）
 * PUT /api/v1/admin/properties/:id/reject
 */
export async function rejectProperty(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await adminService.rejectProperty(id, reason);

    res.status(200).json({
      success: true,
      data: {
        message: '施設を却下しました',
      },
    });
  } catch (error) {
    logger.error('施設却下エラー:', error);
    if (error instanceof Error && error.message === '施設が見つかりません') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '施設の却下に失敗しました',
        },
      });
    }
  }
}

/**
 * 全予約一覧を取得（管理者専用）
 * GET /api/v1/admin/bookings
 */
export async function getBookings(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | undefined;
    const propertyId = req.query.propertyId as string | undefined;

    const result = await adminService.getBookings(page, limit, status, propertyId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('予約一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '予約一覧の取得に失敗しました',
      },
    });
  }
}

/**
 * 統計情報を取得（管理者専用）
 * GET /api/v1/admin/statistics
 */
export async function getStatistics(_req: Request, res: Response) {
  try {
    const statistics = await adminService.getStatistics();

    res.status(200).json({
      success: true,
      data: {
        statistics,
      },
    });
  } catch (error) {
    logger.error('統計情報取得エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '統計情報の取得に失敗しました',
      },
    });
  }
}
