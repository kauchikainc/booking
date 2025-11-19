'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Booking, BookingStatus } from '@/lib/types';
import Link from 'next/link';

/**
 * 予約管理ページ（管理者向け）
 */
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フィルター状態
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // 予約一覧を取得
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAdminBookings(
        currentPage,
        20,
        statusFilter || undefined
      );
      setBookings(response.bookings);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  // ステータスバッジの色を取得
  const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800';
      case 'CHECKED_OUT':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスラベルを取得
  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return '確定';
      case 'PENDING':
        return '保留中';
      case 'CHECKED_IN':
        return 'チェックイン済み';
      case 'CHECKED_OUT':
        return 'チェックアウト済み';
      case 'CANCELLED':
        return 'キャンセル';
      default:
        return status;
    }
  };

  // 宿泊日数を計算
  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              <Link href="/properties" className="text-gray-300 hover:text-white">
                施設管理
              </Link>
              <Link href="/bookings" className="text-white font-semibold">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">予約管理</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
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
                    setStatusFilter(e.target.value as BookingStatus | '');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">すべて</option>
                  <option value="PENDING">保留中</option>
                  <option value="CONFIRMED">確定</option>
                  <option value="CHECKED_IN">チェックイン済み</option>
                  <option value="CHECKED_OUT">チェックアウト済み</option>
                  <option value="CANCELLED">キャンセル</option>
                </select>
              </div>
            </div>
          </div>

          {/* 予約一覧 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                予約一覧（{total}件）
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">読み込み中...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">予約が見つかりません</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            予約ID: {booking.id.substring(0, 8)}...
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>

                        <div className="text-sm text-gray-700 space-y-1 mb-3">
                          <div className="font-semibold">
                            🏨 {booking.room?.property?.name} - {booking.room?.name}
                          </div>
                          <div>
                            📍 {booking.room?.property?.address}
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            👤 予約者: {booking.guestName} ({booking.guestEmail})
                          </div>
                          <div>
                            📞 電話番号: {booking.guestPhone}
                          </div>
                          <div>
                            📅 チェックイン: {new Date(booking.checkInDate).toLocaleDateString('ja-JP')} |
                            チェックアウト: {new Date(booking.checkOutDate).toLocaleDateString('ja-JP')} |
                            {calculateNights(booking.checkInDate, booking.checkOutDate)}泊
                          </div>
                          <div>
                            👥 人数: {booking.numberOfGuests}名
                          </div>
                          <div className="font-semibold text-gray-900">
                            💰 合計金額: ¥{booking.totalPrice.toLocaleString()}
                          </div>
                          {booking.specialRequests && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <span className="font-medium">特別なリクエスト:</span> {booking.specialRequests}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            予約日時: {new Date(booking.createdAt).toLocaleString('ja-JP')}
                          </div>
                          {booking.cancelledAt && (
                            <div className="text-xs text-red-500">
                              キャンセル日時: {new Date(booking.cancelledAt).toLocaleString('ja-JP')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
