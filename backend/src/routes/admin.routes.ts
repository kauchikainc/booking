import { Router } from 'express';
import { body, param } from 'express-validator/lib/middlewares/validation-chain-builders';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

/**
 * ユーザーステータス更新のバリデーションルール
 */
const updateUserStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('有効なユーザーIDを指定してください'),
  body('status')
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('ステータスは ACTIVE, INACTIVE, SUSPENDED のいずれかである必要があります'),
];

/**
 * 施設却下のバリデーションルール
 */
const rejectPropertyValidation = [
  param('id')
    .isUUID()
    .withMessage('有効な施設IDを指定してください'),
  body('reason')
    .trim()
    .isLength({ min: 1 })
    .withMessage('却下理由は必須です'),
];

/**
 * GET /api/v1/admin/users
 * ユーザー一覧を取得（管理者専用）
 */
router.get(
  '/users',
  authenticate,
  authorize('ADMIN'),
  adminController.getUsers
);

/**
 * PUT /api/v1/admin/users/:id/status
 * ユーザーステータスを更新（管理者専用）
 */
router.put(
  '/users/:id/status',
  authenticate,
  authorize('ADMIN'),
  validateRequest(updateUserStatusValidation),
  adminController.updateUserStatus
);

/**
 * GET /api/v1/admin/properties
 * 全施設一覧を取得（管理者専用）
 */
router.get(
  '/properties',
  authenticate,
  authorize('ADMIN'),
  adminController.getProperties
);

/**
 * PUT /api/v1/admin/properties/:id/approve
 * 施設を承認（管理者専用）
 */
router.put(
  '/properties/:id/approve',
  authenticate,
  authorize('ADMIN'),
  adminController.approveProperty
);

/**
 * PUT /api/v1/admin/properties/:id/reject
 * 施設を却下（管理者専用）
 */
router.put(
  '/properties/:id/reject',
  authenticate,
  authorize('ADMIN'),
  validateRequest(rejectPropertyValidation),
  adminController.rejectProperty
);

/**
 * GET /api/v1/admin/bookings
 * 全予約一覧を取得（管理者専用）
 */
router.get(
  '/bookings',
  authenticate,
  authorize('ADMIN'),
  adminController.getBookings
);

/**
 * GET /api/v1/admin/statistics
 * 統計情報を取得（管理者専用）
 */
router.get(
  '/statistics',
  authenticate,
  authorize('ADMIN'),
  adminController.getStatistics
);

export default router;
