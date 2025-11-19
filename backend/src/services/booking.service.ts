import prisma from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * 予約作成データ
 */
export interface CreateBookingData {
  roomId: string;
  checkInDate: string; // YYYY-MM-DD format
  checkOutDate: string; // YYYY-MM-DD format
  numberOfGuests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  paymentMethod: PaymentMethod; // 支払い方法（ONSITE: 現地払い、CREDIT_CARD: クレジットカード）
  cardLast4?: string; // カード番号下4桁（クレカ払いの場合）
}

/**
 * 予約更新データ
 */
export interface UpdateBookingData {
  status?: BookingStatus;
  specialRequests?: string;
}

/**
 * 新しい予約を作成
 */
export async function createBooking(userId: string, data: CreateBookingData) {
  // ゲストプロフィールを取得
  const guestProfile = await prisma.guestProfile.findUnique({
    where: { userId },
  });

  if (!guestProfile) {
    throw new AppError(403, '一般利用者のみ予約が可能です');
  }

  // 部屋の存在確認と料金取得
  const room = await prisma.room.findUnique({
    where: { id: data.roomId },
    include: {
      property: true,
    },
  });

  if (!room) {
    throw new AppError(404, '部屋が見つかりません');
  }

  if (room.status !== 'AVAILABLE') {
    throw new AppError(400, 'この部屋は現在予約できません');
  }

  // 日付の妥当性チェック
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    throw new AppError(400, 'チェックイン日は本日以降を指定してください');
  }

  if (checkOut <= checkIn) {
    throw new AppError(400, 'チェックアウト日はチェックイン日より後を指定してください');
  }

  // 宿泊日数を計算
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = room.pricePerNight * nights;

  // 予約の重複チェック
  const overlappingBookings = await prisma.booking.count({
    where: {
      roomId: data.roomId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
      },
      OR: [
        {
          AND: [
            { checkInDate: { lte: checkIn } },
            { checkOutDate: { gt: checkIn } },
          ],
        },
        {
          AND: [
            { checkInDate: { lt: checkOut } },
            { checkOutDate: { gte: checkOut } },
          ],
        },
        {
          AND: [
            { checkInDate: { gte: checkIn } },
            { checkOutDate: { lte: checkOut } },
          ],
        },
      ],
    },
  });

  if (overlappingBookings >= room.quantity) {
    throw new AppError(400, '指定された日程は満室です');
  }

  // 支払いステータスを決定
  // ONSITE（現地払い）の場合はPENDING、CREDIT_CARD（クレカ払い）の場合はCOMPLETED
  const paymentStatus: PaymentStatus = data.paymentMethod === 'ONSITE' ? 'PENDING' : 'COMPLETED';

  // 予約を作成
  const booking = await prisma.booking.create({
    data: {
      guestId: guestProfile.id,
      roomId: data.roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: data.numberOfGuests,
      totalPrice,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      specialRequests: data.specialRequests,
      paymentMethod: data.paymentMethod,
      paymentStatus,
      cardLast4: data.cardLast4,
      status: 'CONFIRMED',
    },
    include: {
      room: {
        include: {
          property: true,
        },
      },
    },
  });

  return booking;
}

/**
 * ゲストの予約一覧を取得
 */
export async function getGuestBookings(userId: string) {
  const guestProfile = await prisma.guestProfile.findUnique({
    where: { userId },
  });

  if (!guestProfile) {
    throw new AppError(403, '一般利用者のみアクセス可能です');
  }

  const bookings = await prisma.booking.findMany({
    where: { guestId: guestProfile.id },
    include: {
      room: {
        include: {
          property: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
}

/**
 * オーナーの物件の予約一覧を取得
 */
export async function getOwnerBookings(userId: string) {
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId },
    include: {
      properties: {
        include: {
          rooms: {
            include: {
              bookings: {
                include: {
                  room: {
                    include: {
                      property: true,
                    },
                  },
                  guest: true,
                },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      },
    },
  });

  if (!ownerProfile) {
    throw new AppError(403, '施設オーナーのみアクセス可能です');
  }

  // 全ての予約を平坦化
  const bookings = ownerProfile.properties.flatMap((property) =>
    property.rooms.flatMap((room) => room.bookings)
  );

  return bookings;
}

/**
 * 予約詳細を取得
 */
export async function getBookingById(bookingId: string, userId: string, role: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: {
        include: {
          property: {
            include: {
              owner: true,
            },
          },
        },
      },
      guest: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new AppError(404, '予約が見つかりません');
  }

  // アクセス権限チェック
  if (role === 'GUEST') {
    const guestProfile = await prisma.guestProfile.findUnique({
      where: { userId },
    });
    if (!guestProfile || booking.guestId !== guestProfile.id) {
      throw new AppError(403, 'アクセス権限がありません');
    }
  } else if (role === 'OWNER') {
    if (booking.room.property.owner.userId !== userId) {
      throw new AppError(403, 'アクセス権限がありません');
    }
  }

  return booking;
}

/**
 * 予約をキャンセル
 */
export async function cancelBooking(bookingId: string, userId: string, role: string) {
  const booking = await getBookingById(bookingId, userId, role);

  if (booking.status === 'CANCELLED') {
    throw new AppError(400, '既にキャンセルされています');
  }

  if (booking.status === 'CHECKED_OUT') {
    throw new AppError(400, 'チェックアウト済みの予約はキャンセルできません');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
    include: {
      room: {
        include: {
          property: true,
        },
      },
    },
  });

  return updatedBooking;
}

/**
 * 予約ステータスを更新（オーナー専用）
 */
export async function updateBookingStatus(
  bookingId: string,
  userId: string,
  status: BookingStatus
) {
  await getBookingById(bookingId, userId, 'OWNER');

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      room: {
        include: {
          property: true,
        },
      },
      guest: true,
    },
  });

  return updatedBooking;
}
