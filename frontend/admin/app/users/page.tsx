'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/lib/types';
import Link from 'next/link';

/**
 * ユーザー管理ページ（管理者向け）
 */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // フィルター状態
  const [roleFilter, setRoleFilter] = useState<'GUEST' | 'OWNER' | 'ADMIN' | ''>('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getUsers(
        currentPage,
        20,
        roleFilter || undefined,
        statusFilter || undefined,
        searchQuery || undefined
      );
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, roleFilter, statusFilter]);

  // 検索実行
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  // ステータス更新
  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    if (!confirm(`このユーザーのステータスを${newStatus}に変更してもよろしいですか?`)) {
      return;
    }

    try {
      setError(null);
      await apiClient.updateUserStatus(userId, { status: newStatus });
      setSuccessMessage('ステータスを更新しました');
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ステータスの更新に失敗しました');
    }
  };

  // ロールバッジの色を取得
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'OWNER':
        return 'bg-blue-100 text-blue-800';
      case 'GUEST':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスバッジの色を取得
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ロールラベルを取得
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '管理者';
      case 'OWNER':
        return 'オーナー';
      case 'GUEST':
        return '一般利用者';
      default:
        return role;
    }
  };

  // ステータスラベルを取得
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'アクティブ';
      case 'INACTIVE':
        return '非アクティブ';
      case 'SUSPENDED':
        return '停止中';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <svg
                  className="w-8 h-8 text-red-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h2 className="text-xl font-bold text-white">システム管理画面</h2>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-300 hover:text-white">
                ダッシュボード
              </Link>
              <Link href="/users" className="text-white font-semibold">
                ユーザー管理
              </Link>
              <Link href="/properties" className="text-gray-300 hover:text-white">
                施設管理
              </Link>
              <Link href="/bookings" className="text-gray-300 hover:text-white">
                予約管理
              </Link>
              <Link href="/invitations" className="text-gray-300 hover:text-white">
                招待管理
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">ユーザー管理</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {/* フィルター・検索 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  ロール
                </label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as 'GUEST' | 'OWNER' | 'ADMIN' | '');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">すべて</option>
                  <option value="GUEST">一般利用者</option>
                  <option value="OWNER">オーナー</option>
                  <option value="ADMIN">管理者</option>
                </select>
              </div>

              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | '');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">すべて</option>
                  <option value="ACTIVE">アクティブ</option>
                  <option value="INACTIVE">非アクティブ</option>
                  <option value="SUSPENDED">停止中</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  検索（メールアドレス・名前）
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="検索..."
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-r-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    検索
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ユーザー一覧 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                ユーザー一覧（{total}件）
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">読み込み中...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">ユーザーが見つかりません</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メールアドレス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ロール
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メール認証
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登録日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                            {getStatusLabel(user.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.emailVerified ? '✅ 認証済み' : '❌ 未認証'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {user.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                              className="text-green-600 hover:text-green-900"
                            >
                              有効化
                            </button>
                          )}
                          {user.status !== 'SUSPENDED' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              停止
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  ページ {currentPage} / {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    前へ
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    次へ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
