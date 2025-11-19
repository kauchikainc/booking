'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Property, PropertyStatus } from '@/lib/types';
import Link from 'next/link';

/**
 * 施設管理ページ（管理者向け）
 */
export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // フィルター状態
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | ''>('');

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // 却下理由入力用
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingPropertyId, setRejectingPropertyId] = useState<string | null>(null);

  // 施設一覧を取得
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAdminProperties(
        currentPage,
        20,
        statusFilter || undefined
      );
      setProperties(response.properties);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '施設一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [currentPage, statusFilter]);

  // 施設を承認
  const handleApprove = async (propertyId: string) => {
    if (!confirm('この施設を承認してもよろしいですか?')) {
      return;
    }

    try {
      setError(null);
      await apiClient.approveProperty(propertyId);
      setSuccessMessage('施設を承認しました');
      await fetchProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : '施設の承認に失敗しました');
    }
  };

  // 施設を却下
  const handleReject = async (propertyId: string) => {
    if (!rejectReason.trim()) {
      setError('却下理由を入力してください');
      return;
    }

    try {
      setError(null);
      await apiClient.rejectProperty(propertyId, rejectReason);
      setSuccessMessage('施設を却下しました');
      setRejectingPropertyId(null);
      setRejectReason('');
      await fetchProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : '施設の却下に失敗しました');
    }
  };

  // ステータスバッジの色を取得
  const getStatusBadgeColor = (status: PropertyStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスラベルを取得
  const getStatusLabel = (status: PropertyStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return '公開中';
      case 'DRAFT':
        return '下書き';
      case 'SUSPENDED':
        return '停止中';
      case 'CLOSED':
        return '閉鎖';
      default:
        return status;
    }
  };

  // 物件タイプのラベルを取得
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'HOTEL':
        return 'ホテル';
      case 'HOSTEL':
        return 'ホステル';
      case 'GUESTHOUSE':
        return 'ゲストハウス';
      case 'APARTMENT':
        return 'アパートメント';
      case 'RESORT':
        return 'リゾート';
      default:
        return type;
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
              <Link href="/users" className="text-gray-300 hover:text-white">
                ユーザー管理
              </Link>
              <Link href="/properties" className="text-white font-semibold">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">施設管理</h1>

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

          {/* フィルター */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">すべて</option>
                  <option value="DRAFT">下書き</option>
                  <option value="PUBLISHED">公開中</option>
                  <option value="SUSPENDED">停止中</option>
                  <option value="CLOSED">閉鎖</option>
                </select>
              </div>
            </div>
          </div>

          {/* 施設一覧 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                施設一覧（{total}件）
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">読み込み中...</div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 text-gray-500">施設が見つかりません</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {properties.map((property) => (
                  <div key={property.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {property.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(property.status)}`}>
                            {getStatusLabel(property.status)}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getTypeLabel(property.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {property.description}
                        </p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>📍 {property.address}</div>
                          <div>
                            🏢 オーナー: {property.owner?.email}
                            {property.owner?.ownerProfile?.companyName &&
                              ` (${property.owner.ownerProfile.companyName})`}
                          </div>
                          <div>
                            🛏️ 部屋数: {property._count?.rooms || 0}件 |
                            📅 予約数: {property._count?.bookings || 0}件
                          </div>
                          <div className="text-xs text-gray-400">
                            登録日: {new Date(property.createdAt).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        {property.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleApprove(property.id)}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              承認
                            </button>
                            <button
                              onClick={() => setRejectingPropertyId(property.id)}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              却下
                            </button>
                          </>
                        )}
                        {property.status === 'PUBLISHED' && (
                          <button
                            onClick={() => setRejectingPropertyId(property.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            停止
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 却下理由入力 */}
                    {rejectingPropertyId === property.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          却下理由
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="却下理由を入力してください"
                        />
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleReject(property.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            却下を確定
                          </button>
                          <button
                            onClick={() => {
                              setRejectingPropertyId(null);
                              setRejectReason('');
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
