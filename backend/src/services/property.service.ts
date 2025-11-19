import { PropertyType, PropertyStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/error-handler';

/**
 * 物件作成のリクエストデータ型
 */
export interface CreatePropertyData {
  name: string;
  description: string;
  type: PropertyType;
  address: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  checkInTime: string;
  checkOutTime: string;
}

/**
 * 物件更新のリクエストデータ型
 */
export interface UpdatePropertyData {
  name?: string;
  description?: string;
  type?: PropertyType;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  checkInTime?: string;
  checkOutTime?: string;
  status?: PropertyStatus;
}

/**
 * 物件を作成（オーナーのみ）
 */
export async function createProperty(ownerId: string, data: CreatePropertyData) {
  // オーナープロフィールの存在確認
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    throw new AppError(403, '施設オーナーのみ物件を作成できます');
  }

  const property = await prisma.property.create({
    data: {
      ...data,
      ownerId: ownerProfile.id,
    },
    include: {
      owner: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      images: true,
      amenities: true,
      rooms: true,
    },
  });

  return property;
}

/**
 * 公開中の物件一覧を取得（ゲスト向け）- 拡張検索対応
 */
export async function getPublishedProperties(params?: {
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  keyword?: string;
  area?: string;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) {
  const {
    type,
    minPrice,
    maxPrice,
    guests,
    keyword,
    area,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 20,
    offset = 0,
  } = params || {};

  // WHERE条件の構築
  const where: any = {
    status: PropertyStatus.PUBLISHED,
  };

  // 物件タイプフィルター
  if (type) {
    where.type = type;
  }

  // エリア検索
  if (area) {
    where.address = {
      contains: area,
      mode: 'insensitive',
    };
  }

  // キーワード検索（物件名、説明文、住所）
  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
      { address: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  // 部屋条件（価格・人数）
  if (minPrice !== undefined || maxPrice !== undefined || guests !== undefined) {
    where.rooms = {
      some: {
        status: 'AVAILABLE',
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              pricePerNight: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            }
          : {}),
        ...(guests !== undefined && { capacity: { gte: guests } }),
      },
    };
  }

  // ソート条件の構築
  let orderBy: any;
  if (sortBy === 'price') {
    // 価格順でソート（最低価格の部屋を基準）
    orderBy = {
      rooms: {
        _min: {
          pricePerNight: sortOrder,
        },
      },
    };
  } else if (sortBy === 'name') {
    orderBy = { name: sortOrder };
  } else {
    // デフォルト：作成日時順
    orderBy = { createdAt: sortOrder };
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        rooms: {
          where: { status: 'AVAILABLE' },
          orderBy: { pricePerNight: 'asc' },
          take: 5, // より多くの部屋情報を取得
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    total,
    limit,
    offset,
  };
}

/**
 * オーナーの物件一覧を取得
 */
export async function getOwnerProperties(ownerId: string, params?: {
  status?: PropertyStatus;
  limit?: number;
  offset?: number;
}) {
  const { status, limit = 20, offset = 0 } = params || {};

  // オーナープロフィールの取得
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    throw new AppError(403, '施設オーナーのみアクセスできます');
  }

  const where = {
    ownerId: ownerProfile.id,
    ...(status && { status }),
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        rooms: true,
        amenities: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    total,
    limit,
    offset,
  };
}

/**
 * 物件詳細を取得
 */
export async function getPropertyById(propertyId: string, userId?: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      images: {
        orderBy: { order: 'asc' },
      },
      amenities: true,
      rooms: {
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!property) {
    throw new AppError(404, '物件が見つかりません');
  }

  // 公開済み物件のみゲストに表示
  if (property.status !== PropertyStatus.PUBLISHED && !userId) {
    throw new AppError(404, '物件が見つかりません');
  }

  // オーナー以外は下書きや停止中の物件を見れない
  if (property.status !== PropertyStatus.PUBLISHED) {
    if (!userId || property.owner.userId !== userId) {
      throw new AppError(404, '物件が見つかりません');
    }
  }

  return property;
}

/**
 * 物件を更新（オーナーのみ）
 */
export async function updateProperty(
  propertyId: string,
  ownerId: string,
  data: UpdatePropertyData
) {
  // 物件の所有者確認
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { owner: true },
  });

  if (!property) {
    throw new AppError(404, '物件が見つかりません');
  }

  if (property.owner.userId !== ownerId) {
    throw new AppError(403, 'この物件を更新する権限がありません');
  }

  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data,
    include: {
      owner: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      images: true,
      amenities: true,
      rooms: true,
    },
  });

  return updatedProperty;
}

/**
 * 物件を削除（オーナーのみ）
 */
export async function deleteProperty(propertyId: string, ownerId: string) {
  // 物件の所有者確認
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { owner: true },
  });

  if (!property) {
    throw new AppError(404, '物件が見つかりません');
  }

  if (property.owner.userId !== ownerId) {
    throw new AppError(403, 'この物件を削除する権限がありません');
  }

  await prisma.property.delete({
    where: { id: propertyId },
  });
}
