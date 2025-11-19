'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // ログインページと登録ページではナビゲーションを表示しない
  const hideNavbarPaths = ['/login', '/register', '/'];
  if (hideNavbarPaths.includes(pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // 現在のページかどうかを判定
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // ナビゲーションリンクのスタイル
  const getLinkClassName = (path: string) => {
    const baseClass = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    const activeClass = 'bg-blue-700 text-white';
    const inactiveClass = 'text-blue-100 hover:bg-blue-600 hover:text-white';

    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左側: ロゴとナビゲーションリンク */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-white text-xl font-bold">施設用管理画面</span>
            </Link>

            <div className="hidden md:flex md:space-x-2 ml-6">
              <Link href="/dashboard" className={getLinkClassName('/dashboard')}>
                ダッシュボード
              </Link>
              <Link href="/properties" className={getLinkClassName('/properties')}>
                物件管理
              </Link>
              <Link href="/bookings" className={getLinkClassName('/bookings')}>
                予約管理
              </Link>
            </div>
          </div>

          {/* 右側: ユーザー情報とログアウト */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <Link
                href="/profile"
                className="text-blue-100 hover:text-white text-sm"
              >
                {user?.ownerProfile?.companyName || user?.email || 'プロフィール'}
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className="md:hidden pb-3 space-y-1">
          <Link
            href="/dashboard"
            className={`block ${getLinkClassName('/dashboard')}`}
          >
            ダッシュボード
          </Link>
          <Link
            href="/properties"
            className={`block ${getLinkClassName('/properties')}`}
          >
            物件管理
          </Link>
          <Link
            href="/bookings"
            className={`block ${getLinkClassName('/bookings')}`}
          >
            予約管理
          </Link>
          <Link
            href="/profile"
            className={`block ${getLinkClassName('/profile')}`}
          >
            プロフィール
          </Link>
        </div>
      </div>
    </nav>
  );
}
