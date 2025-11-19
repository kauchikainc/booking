import { Router } from 'express';
import { body } from 'express-validator/lib/middlewares/validation-chain-builders';
import * as propertyController from '../controllers/property.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * 物件作成のバリデーションルール
 */
const createPropertyValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('物件名は1〜200文字である必要があります'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('説明は必須です'),
  body('type')
    .isIn(['HOTEL', 'HOSTEL', 'GUESTHOUSE', 'APARTMENT', 'RESORT'])
    .withMessage('有効な物件タイプを選択してください'),
  body('address')
    .trim()
    .isLength({ min: 1 })
    .withMessage('住所は必須です'),
  body('postalCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('郵便番号は10文字以内である必要があります'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('緯度は-90〜90の範囲である必要があります'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('経度は-180〜180の範囲である必要があります'),
  body('checkInTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('チェックイン時刻はHH:MM形式である必要があります'),
  body('checkOutTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('チェックアウト時刻はHH:MM形式である必要があります'),
];

/**
 * 物件更新のバリデーションルール
 */
const updatePropertyValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('物件名は1〜200文字である必要があります'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('説明は必須です'),
  body('type')
    .optional()
    .isIn(['HOTEL', 'HOSTEL', 'GUESTHOUSE', 'APARTMENT', 'RESORT'])
    .withMessage('有効な物件タイプを選択してください'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('住所は必須です'),
  body('postalCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('郵便番号は10文字以内である必要があります'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('緯度は-90〜90の範囲である必要があります'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('経度は-180〜180の範囲である必要があります'),
  body('checkInTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('チェックイン時刻はHH:MM形式である必要があります'),
  body('checkOutTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('チェックアウト時刻はHH:MM形式である必要があります'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'SUSPENDED', 'CLOSED'])
    .withMessage('有効なステータスを選択してください'),
];

/**
 * POST /api/v1/properties
 * 物件を作成（オーナーのみ）
 */
router.post(
  '/',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validateRequest(createPropertyValidation),
  propertyController.createProperty
);

/**
 * GET /api/v1/properties
 * 公開中の物件一覧を取得（全ユーザー）
 */
router.get(
  '/',
  propertyController.getPublishedProperties
);

/**
 * GET /api/v1/properties/my
 * オーナーの物件一覧を取得（オーナーのみ）
 */
router.get(
  '/my',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  propertyController.getOwnerProperties
);

/**
 * GET /api/v1/properties/:id
 * 物件詳細を取得
 */
router.get(
  '/:id',
  propertyController.getPropertyById
);

/**
 * PUT /api/v1/properties/:id
 * 物件を更新（オーナーのみ）
 */
router.put(
  '/:id',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validateRequest(updatePropertyValidation),
  propertyController.updateProperty
);

/**
 * DELETE /api/v1/properties/:id
 * 物件を削除（オーナーのみ）
 */
router.delete(
  '/:id',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  propertyController.deleteProperty
);

export default router;
