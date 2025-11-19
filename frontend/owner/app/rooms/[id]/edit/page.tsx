'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Room, Booking } from '@/lib/types';

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    capacity: '',
    bedType: '',
    pricePerNight: '',
    quantity: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE',
  });

  useEffect(() => {
    async function fetchRoom() {
      try {
        setLoading(true);
        const [roomData, allBookings] = await Promise.all([
          apiClient.getRoom(roomId),
          apiClient.getOwnerBookings(),
        ]);
        setRoom(roomData);
        setFormData({
          name: roomData.name,
          description: roomData.description || '',
          size: roomData.size?.toString() || '',
          capacity: roomData.capacity.toString(),
          bedType: roomData.bedType || '',
          pricePerNight: roomData.pricePerNight.toString(),
          quantity: roomData.quantity.toString(),
          status: roomData.status,
        });
        // この部屋に関連する予約のみフィルタリング
        const roomBookings = allBookings.filter(
          (booking) => booking.room.id === roomId
        );
        setBookings(roomBookings);
      } catch (err: any) {
        console.error('部屋情報の取得に失敗:', err);
        setError(err.message || '部屋情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchRoom();
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiClient.updateRoom(roomId, {
        name: formData.name,
        description: formData.description || undefined,
        size: formData.size ? parseInt(formData.size) : undefined,
        capacity: parseInt(formData.capacity),
        bedType: formData.bedType || undefined,
        pricePerNight: parseInt(formData.pricePerNight),
        quantity: parseInt(formData.quantity),
        status: formData.status,
      });

      // 元のページに戻る
      if (room?.propertyId) {
        router.push(`/properties/${room.propertyId}`);
      } else {
        router.push('/properties');
      }
    } catch (err: any) {
      setError(err.message || '部屋の更新に失敗しました');
      setSubmitting(false);
    }
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

  if (error && !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => router.push('/properties')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            物件一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => {
              if (room?.propertyId) {
                router.push(`/properties/${room.propertyId}`);
              } else {
                router.push('/properties');
              }
            }}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← 戻る
          </button>
          <h2 className="text-3xl font-bold text-gray-900">部屋情報を編集</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部屋名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                maxLength={100}
                placeholder="例: スタンダードルーム"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="部屋の説明を入力してください"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  広さ (m²)
                </label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  定員 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                  placeholder="2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ベッドタイプ
              </label>
              <input
                type="text"
                value={formData.bedType}
                onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: ダブルベッド"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1泊あたりの料金（円） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  placeholder="8000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  部屋数
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="AVAILABLE">利用可能</option>
                <option value="UNAVAILABLE">利用不可</option>
                <option value="MAINTENANCE">メンテナンス中</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (room?.propertyId) {
                    router.push(`/properties/${room.propertyId}`);
                  } else {
                    router.push('/properties');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                disabled={submitting}
              >
                {submitting ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        </div>

        {/* 予約一覧セクション */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">この部屋への予約</h2>
            <Link
              href="/bookings"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              全ての予約を見る →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">予約がありません</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {booking.guest?.firstName && booking.guest?.lastName
                          ? `${booking.guest.firstName} ${booking.guest.lastName}`
                          : booking.guestName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {booking.guest?.user?.email || booking.guestEmail}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'CHECKED_IN'
                          ? 'bg-blue-100 text-blue-800'
                          : booking.status === 'CHECKED_OUT'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status === 'CONFIRMED'
                        ? '確定'
                        : booking.status === 'PENDING'
                        ? '保留中'
                        : booking.status === 'CHECKED_IN'
                        ? 'チェックイン済み'
                        : booking.status === 'CHECKED_OUT'
                        ? 'チェックアウト済み'
                        : 'キャンセル'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">チェックイン:</span>{' '}
                      {new Date(booking.checkInDate).toLocaleDateString('ja-JP')}
                    </div>
                    <div>
                      <span className="font-medium">チェックアウト:</span>{' '}
                      {new Date(booking.checkOutDate).toLocaleDateString('ja-JP')}
                    </div>
                    <div>
                      <span className="font-medium">宿泊人数:</span> {booking.numberOfGuests}名
                    </div>
                    <div>
                      <span className="font-medium">合計金額:</span> ¥{booking.totalPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      予約詳細を見る →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
