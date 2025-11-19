'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

/**
 * グローバルナビゲーションバー
 * 全ページで使用される共通コンポーネント
 */
export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, fetchUser, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hasFetchedUser = useRef(false);

  // 初回レンダリング時にユーザー情報を取得（一度だけ）
  useEffect(() => {
    console.log('[Navbar] useEffect実行 - hasFetchedUser.current:', hasFetchedUser.current);
    if (!hasFetchedUser.current) {
      console.log('[Navbar] fetchUser()を呼び出します');
      hasFetchedUser.current = true;
      fetchUser();
    } else {
      console.log('[Navbar] 既にfetchUser()は実行済みです');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空配列：マウント時のみ実行

  // ログアウト処理
  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  // 現在のパスが一致するかチェック
  const isActive = (path: string) => pathname === path;

  // ログイン・登録不要なページ
  const publicPages = ['/login', '/register'];
  const isPublicPage = publicPages.includes(pathname);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ロゴ・ブランド */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              宿泊予約システム
            </Link>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 施設検索 */}
            <Link
              href="/properties"
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                isActive('/properties')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              施設を探す
            </Link>

            {/* ログイン済みの場合のメニュー */}
            {!isLoading && user ? (
              <>
                <Link
                  href="/bookings"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                    isActive('/bookings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  予約一覧
                </Link>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                    isActive('/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  マイページ
                </Link>
                <Link
                  href="/profile"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                    isActive('/profile')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  プロフィール
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                {/* 未ログインの場合 */}
                {!isPublicPage && (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                    >
                      新規登録
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
              aria-label="メニュー"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/properties"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                isActive('/properties')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              施設を探す
            </Link>

            {!isLoading && user ? (
              <>
                <Link
                  href="/bookings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                    isActive('/bookings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  予約一覧
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                    isActive('/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  マイページ
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                    isActive('/profile')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  プロフィール
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                {!isPublicPage && (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                    >
                      新規登録
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}