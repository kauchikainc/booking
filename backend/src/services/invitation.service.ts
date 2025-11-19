import { PrismaClient, Role, InvitationStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * 招待サービス
 * オーナーや管理者への招待を管理する
 */
export class InvitationService {
  /**
   * 招待を作成する
   * @param email 招待するメールアドレス
   * @param role 招待するロール (OWNER または ADMIN)
   * @param invitedBy 招待者のユーザーID
   * @param expiresInDays 有効期限（日数）デフォルト: 7日
   * @returns 作成された招待情報
   */
  async createInvitation(
    email: string,
    role: Role,
    invitedBy: string,
    expiresInDays: number = 7
  ) {
    // Guestロールは招待不可
    if (role === 'GUEST') {
      throw new Error('ゲストロールへの招待はできません');
    }

    // 既存の有効な招待をチェック
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        role,
        status: InvitationStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw new Error('このメールアドレスには既に有効な招待が存在します');
    }

    // 既に登録済みのユーザーかチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    // 招待トークンを生成（32バイトのランダム文字列）
    const token = crypto.randomBytes(32).toString('hex');

    // 有効期限を設定
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 招待を作成
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        invitedBy,
        expiresAt,
      },
      include: {
        invitedByUser: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return invitation;
  }

  /**
   * 招待トークンを検証する
   * @param token 招待トークン
   * @returns 有効な招待情報、無効な場合はnull
   */
  async validateInvitationToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        invitedByUser: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!invitation) {
      return null;
    }

    // ステータスがPENDINGでない場合は無効
    if (invitation.status !== InvitationStatus.PENDING) {
      return null;
    }

    // 有効期限が切れている場合は無効
    if (invitation.expiresAt < new Date()) {
      // 期限切れステータスに更新
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      return null;
    }

    return invitation;
  }

  /**
   * 招待を承認済みにする
   * @param token 招待トークン
   */
  async acceptInvitation(token: string) {
    const invitation = await this.validateInvitationToken(token);

    if (!invitation) {
      throw new Error('無効な招待トークンです');
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    return invitation;
  }

  /**
   * 招待一覧を取得する（管理者用）
   * @param invitedBy 招待者のユーザーID（オプション）
   * @param status 招待ステータス（オプション）
   * @param page ページ番号（デフォルト: 1）
   * @param limit 1ページあたりの件数（デフォルト: 20）
   */
  async getInvitations(
    invitedBy?: string,
    status?: InvitationStatus,
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = {};

    if (invitedBy) {
      where.invitedBy = invitedBy;
    }

    if (status) {
      where.status = status;
    }

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where,
        include: {
          invitedByUser: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invitation.count({ where }),
    ]);

    return {
      invitations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 招待を削除する（管理者用）
   * @param invitationId 招待ID
   */
  async deleteInvitation(invitationId: string) {
    await prisma.invitation.delete({
      where: { id: invitationId },
    });
  }

  /**
   * 期限切れの招待を自動的に無効化する（バッチ処理用）
   */
  async expireOldInvitations() {
    const result = await prisma.invitation.updateMany({
      where: {
        status: InvitationStatus.PENDING,
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: InvitationStatus.EXPIRED,
      },
    });

    return result.count;
  }
}

export default new InvitationService();
