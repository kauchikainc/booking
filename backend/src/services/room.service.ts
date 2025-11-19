import prisma from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { RoomStatus } from '@prisma/client';

/**
 * 部屋作成データ
 */
export interface CreateRoomData {
  propertyId: string;
  name: string;
  description?: string;
  size?: number;
  capacity: number;
  bedType?: string;
  pricePerNight: number;
  quantity?: number;
}

/**
 * 部屋更新データ
 */
export interface UpdateRoomData {
  name?: string;
  description?: string;
  size?: number;
  capacity?: number;
  bedType?: string;
  pricePerNight?: number;
  quantity?: number;
  status?: RoomStatus;
}

/**
 * 物件に新しい部屋を作成
 */
export async function createRoom(ownerId: string, data: CreateRoomData) {
  // オーナープロフィールを取得
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    throw new AppError(403, '施設オーナーのみアクセス可能です');
  }

  // 物件がオーナーのものか確認
  const property = await prisma.property.findFirst({
    where: {
      id: data.propertyId,
      ownerId: ownerProfile.id,
    },
  });

  if (!property) {
    throw new AppError(404, '物件が見つからないか、アクセス権限がありません');
  }

  const room = await prisma.room.create({
    data: {
      ...data,
      quantity: data.quantity || 1,
    },
    include: {
      images: true,
    },
  });

  return room;
}

/**
 * 物件の部屋一覧を取得
 */
export async function getRoomsByPropertyId(propertyId: string) {
  const rooms = await prisma.room.findMany({
    where: { propertyId },
    include: {
      images: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return rooms;
}

/**
 * オーナーの物件の部屋を取得
 */
export async function getOwnerPropertyRooms(ownerId: string, propertyId: string) {
  // オーナープロフィールを取得
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    throw new AppError(403, '施設オーナーのみアクセス可能です');
  }

  // 物件がオーナーのものか確認
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: ownerProfile.id,
    },
  });

  if (!property) {
    throw new AppError(404, '物件が見つからないか、アクセス権限がありません');
  }

  return getRoomsByPropertyId(propertyId);
}

/**
 * 部屋詳細を取得
 */
export async function getRoomById(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      property: {
        include: {
          owner: {
            select: {
              companyName: true,
            },
          },
        },
      },
      images: true,
    },
  });

  if (!room) {
    throw new AppError(404, '部屋が見つかりません');
  }

  return room;
}

/**
 * 部屋情報を更新
 */
export async function updateRoom(ownerId: string, roomId: string, data: UpdateRoomData) {
  // オーナープロフィールを取得
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    throw new AppError(403, '施設オーナーのみアクセス可能です');
  }

  // 部屋の物件がオーナーのものか確認
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      property: {
        ownerId: ownerProfile.id,
      },
    },
  });

  if (!room) {
    throw new AppError(404, '部屋が見つからないか、アクセス権限がありません');
  }

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data,
    include: {
      images: true,
    },
  });

  return updatedRoom;
}

/**
 * 部屋を削除
 */
export async function deleteRoom(ownerId: string, roomId: string) {
  // オーナープロフィールを取得
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    throw new AppError(403, '施設オーナーのみアクセス可能です');
  }

  // 部屋の物件がオーナーのものか確認
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      property: {
        ownerId: ownerProfile.id,
      },
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!room) {
    throw new AppError(404, '部屋が見つからないか、アクセス権限がありません');
  }

  // 予約がある場合は削除不可
  if (room._count.bookings > 0) {
    throw new AppError(400, '予約が存在するため、部屋を削除できません');
  }

  await prisma.room.delete({
    where: { id: roomId },
  });
}
