import { Request, Response, NextFunction } from 'express';
import * as roomService from '../services/room.service';
import logger from '../utils/logger';

/**
 * POST /api/v1/rooms
 * 部屋を作成（オーナー専用）
 */
export async function createRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roomData = req.body;

    logger.info('部屋作成リクエスト', { userId, roomData });

    const room = await roomService.createRoom(userId, roomData);

    res.status(201).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/rooms/property/:propertyId
 * 物件の部屋一覧を取得（公開）
 */
export async function getRoomsByProperty(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { propertyId } = req.params;

    logger.info('物件の部屋一覧取得', { propertyId });

    const rooms = await roomService.getRoomsByPropertyId(propertyId);

    res.json({
      success: true,
      data: { rooms },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/rooms/my/:propertyId
 * 自分の物件の部屋一覧を取得（オーナー専用）
 */
export async function getMyPropertyRooms(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const { propertyId } = req.params;

    logger.info('自分の物件の部屋一覧取得', { userId, propertyId });

    const rooms = await roomService.getOwnerPropertyRooms(userId, propertyId);

    res.json({
      success: true,
      data: { rooms },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/rooms/:id
 * 部屋詳細を取得
 */
export async function getRoomById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    logger.info('部屋詳細取得', { roomId: id });

    const room = await roomService.getRoomById(id);

    res.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/rooms/:id
 * 部屋情報を更新（オーナー専用）
 */
export async function updateRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updateData = req.body;

    logger.info('部屋更新リクエスト', { userId, roomId: id, updateData });

    const room = await roomService.updateRoom(userId, id, updateData);

    res.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/rooms/:id
 * 部屋を削除（オーナー専用）
 */
export async function deleteRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    logger.info('部屋削除リクエスト', { userId, roomId: id });

    await roomService.deleteRoom(userId, id);

    res.json({
      success: true,
      data: { message: '部屋を削除しました' },
    });
  } catch (error) {
    next(error);
  }
}
