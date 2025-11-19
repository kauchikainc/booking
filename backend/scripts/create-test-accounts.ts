import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('テストアカウントを作成中...\n');

  // パスワードハッシュ化（bcryptコスト係数12）
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const guestPassword = await bcrypt.hash('Guest123!', 12);
  const ownerPassword = await bcrypt.hash('Owner123!', 12);

  try {
    // 1. Adminアカウント作成
    console.log('1. Adminアカウント作成中...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        passwordHash: adminPassword,
      },
      create: {
        email: 'admin@example.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
      },
    });
    console.log(`✓ Admin作成完了: ${adminUser.email} (ID: ${adminUser.id})\n`);

    // 2. Guestアカウント作成
    console.log('2. Guestアカウント作成中...');
    const guestUser = await prisma.user.upsert({
      where: { email: 'guest@example.com' },
      update: {
        passwordHash: guestPassword,
      },
      create: {
        email: 'guest@example.com',
        passwordHash: guestPassword,
        role: 'GUEST',
      },
    });

    // Guestプロフィール作成
    await prisma.guestProfile.upsert({
      where: { userId: guestUser.id },
      update: {
        firstName: 'ゲスト',
        lastName: 'テスト',
        phone: '090-1234-5678',
      },
      create: {
        userId: guestUser.id,
        firstName: 'ゲスト',
        lastName: 'テスト',
        phone: '090-1234-5678',
      },
    });
    console.log(`✓ Guest作成完了: ${guestUser.email} (ID: ${guestUser.id})\n`);

    // 3. Ownerアカウント作成
    console.log('3. Ownerアカウント作成中...');
    const ownerUser = await prisma.user.upsert({
      where: { email: 'owner-test@example.com' },
      update: {
        passwordHash: ownerPassword,
      },
      create: {
        email: 'owner-test@example.com',
        passwordHash: ownerPassword,
        role: 'OWNER',
      },
    });

    // Ownerプロフィール作成
    await prisma.ownerProfile.upsert({
      where: { userId: ownerUser.id },
      update: {
        companyName: 'テスト宿泊施設株式会社',
        businessLicense: 'TEST-LICENSE-12345',
        phone: '03-1234-5678',
        address: '東京都渋谷区渋谷1-1-1',
      },
      create: {
        userId: ownerUser.id,
        companyName: 'テスト宿泊施設株式会社',
        businessLicense: 'TEST-LICENSE-12345',
        phone: '03-1234-5678',
        address: '東京都渋谷区渋谷1-1-1',
      },
    });
    console.log(`✓ Owner作成完了: ${ownerUser.email} (ID: ${ownerUser.id})\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ すべてのテストアカウント作成完了！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('テストアカウント情報:');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ Admin アカウント                                     │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ メール: admin@example.com                           │');
    console.log('│ パスワード: Admin123!                                │');
    console.log('│ URL: http://localhost:3103                          │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ Guest アカウント                                     │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ メール: guest@example.com                           │');
    console.log('│ パスワード: Guest123!                                │');
    console.log('│ URL: http://localhost:3101                          │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ Owner アカウント                                     │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ メール: owner-test@example.com                      │');
    console.log('│ パスワード: Owner123!                                │');
    console.log('│ URL: http://localhost:3102                          │');
    console.log('└─────────────────────────────────────────────────────┘\n');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
