import { PropertyType, PropertyStatus } from '@prisma/client';
import * as propertyService from './property.service';
import prisma from '../utils/prisma';

// Prisma Clientのモック
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    property: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ownerProfile: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Property Service - 拡張検索機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublishedProperties - 拡張フィルタリング', () => {
    it('価格範囲でフィルタリングされること（minPrice, maxPrice）', async () => {
      const mockProperties = [
        {
          id: '1',
          name: 'テスト物件',
          rooms: [{ pricePerNight: 10000 }],
        },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);
      (prisma.property.count as jest.Mock).mockResolvedValue(1);

      const result = await propertyService.getPublishedProperties({
        minPrice: 8000,
        maxPrice: 15000,
      });

      // Prismaクエリが正しく呼ばれたか確認
      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: PropertyStatus.PUBLISHED,
            rooms: expect.objectContaining({
              some: expect.objectContaining({
                pricePerNight: {
                  gte: 8000,
                  lte: 15000,
                },
              }),
            }),
          }),
        })
      );

      expect(result.properties).toEqual(mockProperties);
      expect(result.total).toBe(1);
    });

    it('キーワード検索が機能すること（物件名・説明文）', async () => {
      const mockProperties = [
        {
          id: '1',
          name: '温泉旅館',
          description: '天然温泉が自慢',
        },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);
      (prisma.property.count as jest.Mock).mockResolvedValue(1);

      const result = await propertyService.getPublishedProperties({
        keyword: '温泉',
      });

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: PropertyStatus.PUBLISHED,
            OR: expect.arrayContaining([
              { name: { contains: '温泉', mode: 'insensitive' } },
              { description: { contains: '温泉', mode: 'insensitive' } },
              { address: { contains: '温泉', mode: 'insensitive' } },
            ]),
          }),
        })
      );

      expect(result.properties).toEqual(mockProperties);
    });

    it('宿泊人数でフィルタリングされること', async () => {
      const mockProperties = [
        {
          id: '1',
          name: 'ファミリールーム',
          rooms: [{ capacity: 4 }],
        },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);
      (prisma.property.count as jest.Mock).mockResolvedValue(1);

      const result = await propertyService.getPublishedProperties({
        guests: 4,
      });

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: PropertyStatus.PUBLISHED,
            rooms: expect.objectContaining({
              some: expect.objectContaining({
                capacity: {
                  gte: 4,
                },
              }),
            }),
          }),
        })
      );

      expect(result.properties).toEqual(mockProperties);
    });

    it('エリア検索が機能すること', async () => {
      const mockProperties = [
        {
          id: '1',
          name: '東京ホテル',
          address: '東京都渋谷区',
        },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);
      (prisma.property.count as jest.Mock).mockResolvedValue(1);

      const result = await propertyService.getPublishedProperties({
        area: '東京',
      });

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: PropertyStatus.PUBLISHED,
            address: { contains: '東京', mode: 'insensitive' },
          }),
        })
      );

      expect(result.properties).toEqual(mockProperties);
    });

    it('価格の昇順でソートできること', async () => {
      const mockProperties = [
        { id: '1', name: '格安ホテル', rooms: [{ pricePerNight: 5000 }] },
        { id: '2', name: '中級ホテル', rooms: [{ pricePerNight: 10000 }] },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);
      (prisma.property.count as jest.Mock).mockResolvedValue(2);

      const result = await propertyService.getPublishedProperties({
        sortBy: 'price',
        sortOrder: 'asc',
      });

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.objectContaining({
            rooms: expect.objectContaining({
              _min: expect.objectContaining({
                pricePerNight: 'asc',
              }),
            }),
          }),
        })
      );

      expect(result.properties).toEqual(mockProperties);
    });

    it('作成日時の降順でソートできること（デフォルト）', async () => {
      const mockProperties = [
        { id: '2', name: '新しい物件', createdAt: new Date('2025-01-15') },
        { id: '1', name: '古い物件', createdAt: new Date('2025-01-01') },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);
      (prisma.property.count as jest.Mock).mockResolvedValue(2);

      const result = await propertyService.getPublishedProperties({
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );

      expect(result.properties).toEqual(mockProperties);
    });

    it('複数の検索条件を組み合わせて使用できること', async () => {
      const mockProperties = [
        {
          id: '1',
          name: '神奈川の温泉ホテル',
          type: PropertyType.HOTEL,
          address: '神奈川県箱根町',
          rooms: [{ pricePerNight: 12000, capacity: 2 }],
        },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);
      (prisma.property.count as jest.Mock).mockResolvedValue(1);

      const result = await propertyService.getPublishedProperties({
        type: PropertyType.HOTEL,
        minPrice: 10000,
        maxPrice: 15000,
        guests: 2,
        keyword: '温泉',
        area: '神奈川',
      });

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: PropertyStatus.PUBLISHED,
            type: PropertyType.HOTEL,
            address: { contains: '神奈川', mode: 'insensitive' },
            OR: expect.arrayContaining([
              { name: { contains: '温泉', mode: 'insensitive' } },
              { description: { contains: '温泉', mode: 'insensitive' } },
              { address: { contains: '温泉', mode: 'insensitive' } },
            ]),
            rooms: expect.objectContaining({
              some: expect.objectContaining({
                pricePerNight: {
                  gte: 10000,
                  lte: 15000,
                },
                capacity: {
                  gte: 2,
                },
              }),
            }),
          }),
        })
      );

      expect(result.properties).toEqual(mockProperties);
    });
  });
});
