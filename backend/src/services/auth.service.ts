import { Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/error-handler';

/**
 * 一般利用者登録のリクエストデータ型
 */
export interface RegisterGuestData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * 施設オーナー登録のリクエストデータ型
 */
export interface RegisterOwnerData {
  email: string;
  password: string;
  companyName: string;
  businessLicense: string;
  phone: string;
  invitationToken: string; // 招待トークン（必須）
}

/**
 * ログインのリクエストデータ型
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * 認証レスポンスデータ型
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
  expiresIn: string;
}

/**
 * 一般利用者を登録
 */
export async function registerGuest(data: RegisterGuestData): Promise<AuthResponse> {
  const { email, password, firstName, lastName } = data;

  // メールアドレスの重複チェック
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(409, 'このメールアドレスは既に登録されています');
  }

  // パスワードをハッシュ化
  const passwordHash = await hashPassword(password);

  // ユーザーとプロフィールを作成（トランザクション）
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.GUEST,
      guestProfile: {
        create: {
          firstName,
          lastName,
        },
      },
    },
    include: {
      guestProfile: true,
    },
  });

  // JWTトークンを生成
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
    expiresIn: '24h',
  };
}

/**
 * 施設オーナーを登録
 */
export async function registerOwner(data: RegisterOwnerData): Promise<AuthResponse> {
  const { email, password, companyName, businessLicense, phone, invitationToken } = data;

  // 招待トークンを検証
  const invitationService = await import('./invitation.service');
  const invitation = await invitationService.default.validateInvitationToken(invitationToken);

  if (!invitation) {
    throw new AppError(400, '無効な招待トークンです');
  }

  // 招待されたメールアドレスと一致するかチェック
  if (invitation.email !== email) {
    throw new AppError(400, '招待されたメールアドレスと異なります');
  }

  // 招待されたロールがOWNERであることを確認
  if (invitation.role !== Role.OWNER) {
    throw new AppError(400, 'この招待トークンはオーナー用ではありません');
  }

  // メールアドレスの重複チェック
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(409, 'このメールアドレスは既に登録されています');
  }

  // パスワードをハッシュ化
  const passwordHash = await hashPassword(password);

  // ユーザーとオーナープロフィールを作成
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.OWNER,
      ownerProfile: {
        create: {
          companyName,
          businessLicense,
          phone,
          address: '', // 必須フィールドに初期値を設定
        },
      },
    },
    include: {
      ownerProfile: true,
    },
  });

  // 招待を承認済みにする
  await invitationService.default.acceptInvitation(invitationToken);

  // JWTトークンを生成
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
    expiresIn: '24h',
  };
}

/**
 * ログイン
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const { email, password } = data;

  // ユーザーを検索
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(401, 'メールアドレスまたはパスワードが間違っています');
  }

  // パスワードを検証
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'メールアドレスまたはパスワードが間違っています');
  }

  // アカウントが有効かチェック
  if (user.status !== 'ACTIVE') {
    throw new AppError(403, 'このアカウントは無効化されています');
  }

  // JWTトークンを生成
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
    expiresIn: '24h',
  };
}

/**
 * ユーザー情報を取得
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      guestProfile: true,
      ownerProfile: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'ユーザーが見つかりません');
  }

  // パスワードハッシュを除外
  const { passwordHash, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

/**
 * 一般利用者プロフィール更新のリクエストデータ型
 */
export interface UpdateGuestProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  nationality?: string;
}

/**
 * 施設オーナープロフィール更新のリクエストデータ型
 */
export interface UpdateOwnerProfileData {
  companyName?: string;
  representative?: string;
  phone?: string;
  postalCode?: string;
  address?: string;
  businessLicense?: string;
}

/**
 * プロフィールを更新
 */
export async function updateProfile(userId: string, data: UpdateGuestProfileData | UpdateOwnerProfileData) {
  // ユーザーの存在確認とロール取得
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, guestProfile: true, ownerProfile: true },
  });

  if (!user) {
    throw new AppError(404, 'ユーザーが見つかりません');
  }

  // ロールに応じてプロフィールを更新
  if (user.role === Role.GUEST) {
    const guestData = data as UpdateGuestProfileData;

    // guest_profileが存在しない場合は作成
    if (!user.guestProfile) {
      await prisma.guestProfile.create({
        data: {
          userId,
          ...guestData,
        },
      });
    } else {
      await prisma.guestProfile.update({
        where: { userId },
        data: guestData,
      });
    }
  } else if (user.role === Role.OWNER) {
    const ownerData = data as UpdateOwnerProfileData;

    // owner_profileが存在しない場合は作成
    if (!user.ownerProfile) {
      await prisma.ownerProfile.create({
        data: {
          userId,
          phone: ownerData.phone || '',
          address: ownerData.address || '',
          ...ownerData,
        },
      });
    } else {
      await prisma.ownerProfile.update({
        where: { userId },
        data: ownerData,
      });
    }
  }

  // 更新後のユーザー情報を取得
  return getUserById(userId);
}

/**
 * パスワード変更のリクエストデータ型
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * パスワードを変更
 */
export async function changePassword(userId: string, data: ChangePasswordData) {
  const { currentPassword, newPassword } = data;

  // ユーザーを取得
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'ユーザーが見つかりません');
  }

  // 現在のパスワードを検証
  const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, '現在のパスワードが間違っています');
  }

  // 新しいパスワードをハッシュ化
  const newPasswordHash = await hashPassword(newPassword);

  // パスワードを更新
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
}
