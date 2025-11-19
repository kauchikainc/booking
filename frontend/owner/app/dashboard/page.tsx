'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

/**
 * ダッシュボードページ（施設オーナー向け）
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // パスワード変更が必要な場合はパスワード変更ページへリダイレクト
  useEffect(() => {
    if (user?.requirePasswordChange) {
      router.push('/profile/password?required=true');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* ページタイトル */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>
          <p className="text-sm text-gray-600 mt-2">施設オーナー管理画面</p>
        </div>
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-indigo-50">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                アカウント情報
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                施設オーナー情報
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.email}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">ロール</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {user.role}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.status}
                  </dd>
                </div>
                {user.ownerProfile && (
                  <>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">会社名</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user.ownerProfile.companyName || '未設定'}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">電話番号</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user.ownerProfile.phone || '未設定'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              クイックアクセス
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/properties')}
                className="p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition text-left"
              >
                <div className="flex items-center mb-2">
                  <svg
                    className="w-6 h-6 text-indigo-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">物件管理</h2>
                </div>
                <p className="text-sm text-gray-600">物件の登録・編集・削除を行います</p>
              </button>

              <button
                onClick={() => router.push('/bookings')}
                className="p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition text-left"
              >
                <div className="flex items-center mb-2">
                  <svg
                    className="w-6 h-6 text-indigo-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">予約管理</h2>
                </div>
                <p className="text-sm text-gray-600">予約の確認・管理を行います</p>
              </button>

              <div className="p-6 bg-gray-50 rounded-lg text-left opacity-50 cursor-not-allowed">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-6 h-6 text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h4 className="text-lg font-semibold text-gray-400">売上レポート</h4>
                </div>
                <p className="text-sm text-gray-400">売上データの確認（近日公開）</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
