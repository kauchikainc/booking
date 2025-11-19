import { Router } from 'express';
import { body, param } from 'express-validator/lib/middlewares/validation-chain-builders';
import * as roomController from '../controllers/room.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

/**
 * 部屋作成のバリデーションルール
 */
const createRoomValidation = [
  body('propertyId')
    .isUUID()
    .withMessage('有効な物件IDを指定してください'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('部屋名は1〜100文字である必要があります'),
  body('description')
    .optional()
    .trim(),
  body('size')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('部屋の広さは0以上の数値である必要があります'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('定員は1以上の整数である必要があります'),
  body('bedType')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('pricePerNight')
    .isInt({ min: 0 })
    .withMessage('1泊あたりの料金は0以上の整数である必要があります'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('部屋数は1以上の整数である必要があります'),
];

/**
 * 部屋更新のバリデーションルール
 */
const updateRoomValidation = [
  param('id')
    .isUUID()
    .withMessage('有効な部屋IDを指定してください'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('部屋名は1〜100文字である必要があります'),
  body('description')
    .optional()
    .trim(),
  body('size')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('部屋の広さは0以上の数値である必要があります'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('定員は1以上の整数である必要があります'),
  body('bedType')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('pricePerNight')
    .optional()
    .isInt({ min: 0 })
    .withMessage('1泊あたりの料金は0以上の整数である必要があります'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('部屋数は1以上の整数である必要があります'),
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'])
    .withMessage('ステータスは AVAILABLE, UNAVAILABLE, MAINTENANCE のいずれかである必要があります'),
];

/**
 * POST /api/v1/rooms
 * 部屋を作成（オーナー専用）
 */
router.post(
  '/',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validateRequest(createRoomValidation),
  roomController.createRoom
);

/**
 * GET /api/v1/rooms/property/:propertyId
 * 物件の部屋一覧を取得（公開）
 */
router.get(
  '/property/:propertyId',
  roomController.getRoomsByProperty
);

/**
 * GET /api/v1/rooms/my/:propertyId
 * 自分の物件の部屋一覧を取得（オーナー専用）
 */
router.get(
  '/my/:propertyId',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  roomController.getMyPropertyRooms
);

/**
 * GET /api/v1/rooms/:id
 * 部屋詳細を取得
 */
router.get(
  '/:id',
  roomController.getRoomById
);

/**
 * PUT /api/v1/rooms/:id
 * 部屋情報を更新（オーナー専用）
 */
router.put(
  '/:id',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validateRequest(updateRoomValidation),
  roomController.updateRoom
);

/**
 * DELETE /api/v1/rooms/:id
 * 部屋を削除（オーナー専用）
 */
router.delete(
  '/:id',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  roomController.deleteRoom
);

export default router;
