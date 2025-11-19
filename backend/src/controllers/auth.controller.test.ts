import request from 'supertest';
import { createApp } from '../app';
import prisma from '../utils/prisma';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

const app = createApp();

/**
 * テスト用のユーザーデータ
 */
const testUser = {
  email: 'test@example.com',
  password: 'Test1234!',
  firstName: '太郎',
  lastName: '山田',
};

const testOwner = {
  email: 'owner@example.com',
  password: 'Owner1234!',
  companyName: 'テスト株式会社',
  businessLicense: '12345678',
  phone: '090-1234-5678',
};

/**
 * テスト前のクリーンアップ
 */
beforeAll(async () => {
  // テストユーザーが存在する場合は削除
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [testUser.email, testOwner.email, 'updated@example.com'],
      },
    },
  });
});

/**
 * テスト後のクリーンアップ
 */
afterAll(async () => {
  // テストユーザーを削除
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [testUser.email, testOwner.email, 'updated@example.com'],
      },
    },
  });
  await prisma.$disconnect();
});

describe('Auth Controller - Profile Management', () => {
  describe('GET /api/v1/auth/me', () => {
    it('認証済みユーザーの情報を取得できる', async () => {
      // テストユーザーを作成
      const passwordHash = await hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          passwordHash,
          role: 'GUEST',
          guestProfile: {
            create: {
              firstName: testUser.firstName,
              lastName: testUser.lastName,
            },
          },
        },
        include: {
          guestProfile: true,
        },
      });

      // トークンを生成
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.guestProfile.firstName).toBe(testUser.firstName);
      expect(response.body.data.user.guestProfile.lastName).toBe(testUser.lastName);
      expect(response.body.data.user.passwordHash).toBeUndefined(); // パスワードハッシュは含まれない
    });

    it('認証なしではアクセスできない', async () => {
      await request(app).get('/api/v1/auth/me').expect(401);
    });

    it('無効なトークンではアクセスできない', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    it('一般利用者のプロフィールを更新できる', async () => {
      // テストユーザーを作成
      const passwordHash = await hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          passwordHash,
          role: 'GUEST',
          guestProfile: {
            create: {
              firstName: testUser.firstName,
              lastName: testUser.lastName,
            },
          },
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const updateData = {
        firstName: '次郎',
        lastName: '田中',
        phone: '090-9876-5432',
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.guestProfile.firstName).toBe(updateData.firstName);
      expect(response.body.data.user.guestProfile.lastName).toBe(updateData.lastName);
      expect(response.body.data.user.guestProfile.phone).toBe(updateData.phone);
    });

    it('施設オーナーのプロフィールを更新できる', async () => {
      // テストオーナーを作成
      const passwordHash = await hashPassword(testOwner.password);
      const user = await prisma.user.create({
        data: {
          email: testOwner.email,
          passwordHash,
          role: 'OWNER',
          ownerProfile: {
            create: {
              companyName: testOwner.companyName,
              businessLicense: testOwner.businessLicense,
              phone: testOwner.phone,
              address: '東京都渋谷区',
            },
          },
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const updateData = {
        companyName: '更新株式会社',
        phone: '03-1234-5678',
        address: '大阪府大阪市',
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.ownerProfile.companyName).toBe(updateData.companyName);
      expect(response.body.data.user.ownerProfile.phone).toBe(updateData.phone);
      expect(response.body.data.user.ownerProfile.address).toBe(updateData.address);
    });

    it('認証なしでは更新できない', async () => {
      await request(app)
        .put('/api/v1/auth/profile')
        .send({ firstName: '次郎' })
        .expect(401);
    });
  });

  describe('PUT /api/v1/auth/password', () => {
    it('パスワードを変更できる', async () => {
      // テストユーザーを作成
      const passwordHash = await hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          passwordHash,
          role: 'GUEST',
          guestProfile: {
            create: {
              firstName: testUser.firstName,
              lastName: testUser.lastName,
            },
          },
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const newPassword = 'NewPassword123!';

      const response = await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('パスワードを変更しました');

      // 新しいパスワードでログインできることを確認
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();
    });

    it('現在のパスワードが間違っている場合は変更できない', async () => {
      // テストユーザーを作成
      const passwordHash = await hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          passwordHash,
          role: 'GUEST',
          guestProfile: {
            create: {
              firstName: testUser.firstName,
              lastName: testUser.lastName,
            },
          },
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        })
        .expect(401);
    });

    it('新しいパスワードが弱い場合は変更できない', async () => {
      // テストユーザーを作成
      const passwordHash = await hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          passwordHash,
          role: 'GUEST',
          guestProfile: {
            create: {
              firstName: testUser.firstName,
              lastName: testUser.lastName,
            },
          },
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: '123', // 弱いパスワード
        })
        .expect(400);
    });

    it('認証なしではパスワードを変更できない', async () => {
      await request(app)
        .put('/api/v1/auth/password')
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!',
        })
        .expect(401);
    });
  });
});
