'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Booking } from '@/lib/types';
import Navbar from '@/components/Navbar';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const data = await apiClient.getMyBookings();
        setBookings(data);
      } catch (err: any) {
        console.error('予約一覧の取得に失敗:', err);
        setError(err.message || '予約一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('この予約をキャンセルしてもよろしいですか?')) {
      return;
    }

    try {
      await apiClient.cancelBooking(bookingId);
      // 予約リストを更新
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking
        )
      );
    } catch (err: any) {
      alert(err.message || '予約のキャンセルに失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(
      date.getDate()
    ).padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '保留中', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '確定', className: 'bg-green-100 text-green-800' },
      CHECKED_IN: { label: 'チェックイン済み', className: 'bg-blue-100 text-blue-800' },
      CHECKED_OUT: { label: 'チェックアウト済み', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-block px-2 py-1 text-xs rounded ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">予約一覧</h2>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">まだ予約がありません</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              物件を探す
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {booking.room?.property.name || '物件名不明'}
                    </h3>
                    <p className="text-gray-600">{booking.room?.name || '部屋情報なし'}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">チェックイン</p>
                    <p className="text-gray-900 font-medium">{formatDate(booking.checkInDate)}</p>
                    <p className="text-sm text-gray-500">
                      {booking.room?.property.checkInTime || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">チェックアウト</p>
                    <p className="text-gray-900 font-medium">{formatDate(booking.checkOutDate)}</p>
                    <p className="text-sm text-gray-500">
                      {booking.room?.property.checkOutTime || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">宿泊人数</p>
                    <p className="text-gray-900 font-medium">{booking.numberOfGuests}名</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">合計料金</p>
                    <p className="text-gray-900 font-semibold text-lg">
                      ¥{booking.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">住所</p>
                  <p className="text-gray-900">{booking.room?.property.address || '-'}</p>
                </div>

                {booking.specialRequests && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">特別なリクエスト</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{booking.specialRequests}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    詳細を見る
                  </button>
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
