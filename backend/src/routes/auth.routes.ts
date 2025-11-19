import { Router } from 'express';
import { body } from 'express-validator/lib/middlewares/validation-chain-builders';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * 一般利用者登録のバリデーションルール
 */
const registerGuestValidation = [
  body('email')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('パスワードは8文字以上である必要があります')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('パスワードは小文字、大文字、数字を含む必要があります'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('名は1〜50文字である必要があります'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('姓は1〜50文字である必要があります'),
];

/**
 * 施設オーナー登録のバリデーションルール
 */
const registerOwnerValidation = [
  body('email')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('パスワードは8文字以上である必要があります')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('パスワードは小文字、大文字、数字を含む必要があります'),
  body('companyName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('会社名は1〜200文字である必要があります'),
  body('businessLicense')
    .trim()
    .isLength({ min: 1 })
    .withMessage('事業許可番号は必須です'),
  body('phone')
    .trim()
    .isLength({ min: 1 })
    .matches(/^[0-9-]+$/)
    .withMessage('有効な電話番号を入力してください'),
  body('invitationToken')
    .trim()
    .isLength({ min: 1 })
    .withMessage('招待トークンは必須です'),
];

/**
 * ログインのバリデーションルール
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('パスワードを入力してください'),
];

/**
 * POST /api/v1/auth/register/guest
 * 一般利用者登録
 */
router.post(
  '/register/guest',
  validateRequest(registerGuestValidation),
  authController.registerGuest
);

/**
 * POST /api/v1/auth/register/owner
 * 施設オーナー登録
 */
router.post(
  '/register/owner',
  validateRequest(registerOwnerValidation),
  authController.registerOwner
);

/**
 * POST /api/v1/auth/login
 * ログイン
 */
router.post(
  '/login',
  validateRequest(loginValidation),
  authController.login
);

/**
 * GET /api/v1/auth/me
 * 現在のユーザー情報を取得（要認証）
 */
router.get(
  '/me',
  authenticate,
  authController.getMe
);

/**
 * POST /api/v1/auth/logout
 * ログアウト（要認証）
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * PUT /api/v1/auth/profile
 * プロフィール更新（要認証）
 */
const updateProfileValidation = [
  // 一般利用者の場合
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
  body('phone').optional().trim().isLength({ min: 1, max: 20 }),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('nationality').optional().trim().isLength({ min: 2, max: 2 }),
  // 施設オーナーの場合
  body('companyName').optional().trim().isLength({ min: 1, max: 200 }),
  body('representative').optional().trim().isLength({ min: 1, max: 100 }),
  body('postalCode').optional().trim().isLength({ min: 1, max: 10 }),
  body('address').optional().trim().isLength({ min: 1 }),
  body('businessLicense').optional().trim().isLength({ min: 1, max: 100 }),
];

router.put(
  '/profile',
  authenticate,
  validateRequest(updateProfileValidation),
  authController.updateProfile
);

/**
 * PUT /api/v1/auth/password
 * パスワード変更（要認証）
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('現在のパスワードを入力してください'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('新しいパスワードは8文字以上である必要があります')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('新しいパスワードは小文字、大文字、数字を含む必要があります'),
];

router.put(
  '/password',
  authenticate,
  validateRequest(changePasswordValidation),
  authController.changePassword
);

export default router;
