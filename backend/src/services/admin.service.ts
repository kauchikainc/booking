import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ユーザー一覧を取得（管理者専用）
 */
export async function getUsers(
  page: number = 1,
  limit: number = 20,
  role?: 'GUEST' | 'OWNER' | 'ADMIN',
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  search?: string
) {
  const skip = (page - 1) * limit;

  // 検索条件を構築
  const where: any = {};
  if (role) {
    where.role = role;
  }
  if (status) {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { guestProfile: { firstName: { contains: search, mode: 'insensitive' } } },
      { guestProfile: { lastName: { contains: search, mode: 'insensitive' } } },
      { ownerProfile: { companyName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // ユーザー一覧を取得
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        guestProfile: true,
        ownerProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * ユーザーステータスを更新（管理者専用）
 */
export async function updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('ユーザーが見つかりません');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
}

/**
 * 全施設一覧を取得（管理者専用）
 */
export async function getProperties(
  page: number = 1,
  limit: number = 20,
  status?: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'CLOSED'
) {
  const skip = (page - 1) * limit;

  // 検索条件を構築
  const where: any = {};
  if (status) {
    where.status = status;
  }

  // 施設一覧を取得
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * 施設を承認（管理者専用）
 */
export async function approveProperty(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error('施設が見つかりません');
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { status: 'PUBLISHED' },
  });
}

/**
 * 施設を却下（管理者専用）
 */
export async function rejectProperty(propertyId: string, _reason: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error('施設が見つかりません');
  }

  // 却下理由をログに記録（将来的にはrejection_reasonフィールドを追加する）
  await prisma.property.update({
    where: { id: propertyId },
    data: { status: 'SUSPENDED' },
  });

  // TODO: 却下理由をオーナーに通知する機能を実装
}

/**
 * 全予約一覧を取得（管理者専用）
 */
export async function getBookings(
  page: number = 1,
  limit: number = 20,
  status?: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED',
  propertyId?: string
) {
  const skip = (page - 1) * limit;

  // 検索条件を構築
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (propertyId) {
    where.room = {
      propertyId,
    };
  }

  // 予約一覧を取得
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        guest: {
          include: {
            user: true,
          },
        },
        room: {
          include: {
            property: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * 統計情報を取得（管理者専用）
 */
export async function getStatistics() {
  // 並列でデータを取得
  const [
    totalUsers,
    totalGuests,
    totalOwners,
    totalAdmins,
    totalProperties,
    activeProperties,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'GUEST' } }),
    prisma.user.count({ where: { role: 'OWNER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: 'PUBLISHED' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
  ]);

  return {
    totalUsers,
    totalGuests,
    totalOwners,
    totalAdmins,
    totalProperties,
    activeProperties,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
  };
}
