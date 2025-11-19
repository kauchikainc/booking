import { Router } from 'express';
import { body, param } from 'express-validator/lib/middlewares/validation-chain-builders';
import * as bookingController from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

/**
 * 予約作成のバリデーションルール
 */
const createBookingValidation = [
  body('roomId')
    .isUUID()
    .withMessage('有効な部屋IDを指定してください'),
  body('checkInDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('チェックイン日はYYYY-MM-DD形式で指定してください'),
  body('checkOutDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('チェックアウト日はYYYY-MM-DD形式で指定してください'),
  body('numberOfGuests')
    .isInt({ min: 1 })
    .withMessage('宿泊人数は1以上の整数である必要があります'),
  body('guestName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('予約者氏名は1〜200文字である必要があります'),
  body('guestEmail')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),
  body('guestPhone')
    .trim()
    .matches(/^[0-9-]+$/)
    .withMessage('有効な電話番号を入力してください'),
  body('specialRequests')
    .optional()
    .trim(),
];

/**
 * 予約ステータス更新のバリデーションルール
 */
const updateBookingStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('有効な予約IDを指定してください'),
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'])
    .withMessage('ステータスは PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED のいずれかである必要があります'),
];

/**
 * POST /api/v1/bookings
 * 新しい予約を作成（ゲスト専用）
 */
router.post(
  '/',
  authenticate,
  authorize('GUEST', 'ADMIN'),
  validateRequest(createBookingValidation),
  bookingController.createBooking
);

/**
 * GET /api/v1/bookings/my
 * 自分の予約一覧を取得（ゲスト専用）
 */
router.get(
  '/my',
  authenticate,
  authorize('GUEST', 'ADMIN'),
  bookingController.getMyBookings
);

/**
 * GET /api/v1/bookings/owner
 * 自分の物件の予約一覧を取得（オーナー専用）
 */
router.get(
  '/owner',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  bookingController.getOwnerBookings
);

/**
 * GET /api/v1/bookings/:id
 * 予約詳細を取得
 */
router.get(
  '/:id',
  authenticate,
  bookingController.getBookingById
);

/**
 * POST /api/v1/bookings/:id/cancel
 * 予約をキャンセル
 */
router.post(
  '/:id/cancel',
  authenticate,
  bookingController.cancelBooking
);

/**
 * PUT /api/v1/bookings/:id/status
 * 予約ステータスを更新（オーナー専用）
 */
router.put(
  '/:id/status',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validateRequest(updateBookingStatusValidation),
  bookingController.updateBookingStatus
);

export default router;
