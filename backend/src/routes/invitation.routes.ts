import { Router } from 'express';
import { body, param, query } from 'express-validator/lib/middlewares/validation-chain-builders';
import * as invitationController from '../controllers/invitation.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * 招待作成のバリデーションルール
 */
const createInvitationValidation = [
  body('email')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),
  body('role')
    .isIn(['OWNER', 'ADMIN'])
    .withMessage('ロールはOWNERまたはADMINである必要があります'),
  body('expiresInDays')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('有効期限は1〜30日の範囲で指定してください'),
];

/**
 * POST /api/v1/admin/invitations
 * 招待を作成（管理者のみ）
 */
router.post(
  '/admin/invitations',
  authenticate,
  validateRequest(createInvitationValidation),
  invitationController.createInvitation
);

/**
 * GET /api/v1/invitations/validate/:token
 * 招待トークンを検証（認証不要）
 */
router.get(
  '/invitations/validate/:token',
  [
    param('token')
      .isLength({ min: 1 })
      .withMessage('招待トークンは必須です'),
  ],
  validateRequest([]),
  invitationController.validateInvitation
);

/**
 * GET /api/v1/admin/invitations
 * 招待一覧を取得（管理者のみ）
 */
router.get(
  '/admin/invitations',
  authenticate,
  [
    query('status')
      .optional()
      .isIn(['PENDING', 'ACCEPTED', 'EXPIRED'])
      .withMessage('ステータスはPENDING、ACCEPTED、EXPIREDのいずれかである必要があります'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ページ番号は1以上の整数である必要があります'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('1ページあたりの件数は1〜100の範囲である必要があります'),
  ],
  validateRequest([]),
  invitationController.getInvitations
);

/**
 * DELETE /api/v1/admin/invitations/:id
 * 招待を削除（管理者のみ）
 */
router.delete(
  '/admin/invitations/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('有効な招待IDを指定してください'),
  ],
  validateRequest([]),
  invitationController.deleteInvitation
);

export default router;
