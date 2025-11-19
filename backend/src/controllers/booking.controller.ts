import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';
import logger from '../utils/logger';

/**
 * POST /api/v1/bookings
 * 新しい予約を作成（ゲスト専用）
 */
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const bookingData = req.body;

    logger.info('予約作成リクエスト', { userId, bookingData });

    const booking = await bookingService.createBooking(userId, bookingData);

    res.status(201).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/bookings/my
 * 自分の予約一覧を取得（ゲスト専用）
 */
export async function getMyBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;

    logger.info('自分の予約一覧取得', { userId });

    const bookings = await bookingService.getGuestBookings(userId);

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/bookings/owner
 * 自分の物件の予約一覧を取得（オーナー専用）
 */
export async function getOwnerBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;

    logger.info('オーナーの予約一覧取得', { userId });

    const bookings = await bookingService.getOwnerBookings(userId);

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/bookings/:id
 * 予約詳細を取得
 */
export async function getBookingById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const { id } = req.params;

    logger.info('予約詳細取得', { userId, role, bookingId: id });

    const booking = await bookingService.getBookingById(id, userId, role);

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/bookings/:id/cancel
 * 予約をキャンセル
 */
export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const { id } = req.params;

    logger.info('予約キャンセルリクエスト', { userId, role, bookingId: id });

    const booking = await bookingService.cancelBooking(id, userId, role);

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/bookings/:id/status
 * 予約ステータスを更新（オーナー専用）
 */
export async function updateBookingStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status } = req.body;

    logger.info('予約ステータス更新リクエスト', { userId, bookingId: id, status });

    const booking = await bookingService.updateBookingStatus(id, userId, status);

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}
