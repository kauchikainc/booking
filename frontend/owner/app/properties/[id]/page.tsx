'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Property, Room, Booking, PropertyStatus } from '@/lib/types';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // 物件情報、部屋一覧、予約一覧を取得
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [propertyData, roomsData, allBookings] = await Promise.all([
          apiClient.getProperty(propertyId),
          apiClient.getMyPropertyRooms(propertyId),
          apiClient.getOwnerBookings(),
        ]);
        setProperty(propertyData);
        setRooms(roomsData);
        // この物件に関連する予約のみフィルタリング
        const propertyBookings = allBookings.filter(
          (booking) => booking.room?.propertyId === propertyId
        );
        setBookings(propertyBookings);
      } catch (err: unknown) {
        console.error('データの取得に失敗:', err);
        const message = err instanceof Error ? err.message : 'データの取得に失敗しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [propertyId]);

  // 部屋削除
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('この部屋を削除してもよろしいですか?')) {
      return;
    }

    try {
      await apiClient.deleteRoom(roomId);
      setRooms(rooms.filter((room) => room.id !== roomId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '部屋の削除に失敗しました';
      alert(message);
    }
  };

  // 部屋作成後の処理
  const handleRoomCreated = (newRoom: Room) => {
    setRooms([...rooms, newRoom]);
    setShowCreateModal(false);
  };

  // ステータス変更
  const handleStatusChange = async (newStatus: PropertyStatus) => {
    if (!confirm(`物件のステータスを「${getStatusLabel(newStatus)}」に変更しますか?`)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const updatedProperty = await apiClient.updateProperty(propertyId, {
        status: newStatus,
      });
      setProperty(updatedProperty);
      alert('ステータスを更新しました');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ステータスの更新に失敗しました';
      alert(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ステータスラベルを取得
  const getStatusLabel = (status: PropertyStatus) => {
    const statusMap: Record<PropertyStatus, string> = {
      DRAFT: '下書き',
      PUBLISHED: '公開中',
      SUSPENDED: '一時停止',
      CLOSED: '閉鎖',
    };
    return statusMap[status];
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(
      date.getDate()
    ).padStart(2, '0')}`;
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

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || '物件が見つかりません'}</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/properties')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← 物件一覧に戻る
          </button>
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-gray-900">{property.name}</h2>
            <Link
              href={`/properties/${propertyId}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              物件を編集
            </Link>
          </div>
        </div>

        {/* 物件情報カード */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">物件情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">物件タイプ</p>
              <p className="text-gray-900 font-medium">{property.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ステータス</p>
              <p className="text-gray-900 font-medium">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${
                    property.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : property.status === 'DRAFT'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {property.status === 'PUBLISHED'
                    ? '公開中'
                    : property.status === 'DRAFT'
                    ? '下書き'
                    : property.status === 'SUSPENDED'
                    ? '一時停止'
                    : '閉鎖'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">住所</p>
              <p className="text-gray-900">{property.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">郵便番号</p>
              <p className="text-gray-900">{property.postalCode || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">チェックイン時刻</p>
              <p className="text-gray-900">{property.checkInTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">チェックアウト時刻</p>
              <p className="text-gray-900">{property.checkOutTime}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">説明</p>
            <p className="text-gray-900 whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* ステータス変更 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">ステータス変更</h3>
            <div className="flex gap-2 flex-wrap">
              {(['DRAFT', 'PUBLISHED', 'SUSPENDED', 'CLOSED'] as PropertyStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={property.status === status || updatingStatus}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    property.status === status
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : status === 'DRAFT'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : status === 'SUSPENDED'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } disabled:opacity-50`}
                >
                  {getStatusLabel(status)}
                  {property.status === status && ' (現在)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 部屋一覧セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">部屋一覧</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + 部屋を追加
            </button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              まだ部屋が登録されていません。部屋を追加してください。
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        room.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : room.status === 'UNAVAILABLE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {room.status === 'AVAILABLE'
                        ? '利用可能'
                        : room.status === 'UNAVAILABLE'
                        ? '利用不可'
                        : 'メンテナンス中'}
                    </span>
                  </div>

                  {room.description && (
                    <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">広さ</span>
                      <span className="text-gray-900">{room.size ? `${room.size}m²` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">定員</span>
                      <span className="text-gray-900">{room.capacity}名</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ベッドタイプ</span>
                      <span className="text-gray-900">{room.bedType || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">料金（1泊）</span>
                      <span className="text-gray-900 font-semibold">
                        ¥{room.pricePerNight.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">在庫数</span>
                      <span className="text-gray-900">{room.quantity}部屋</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => router.push(`/rooms/${room.id}/edit`)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 予約一覧セクション */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">この物件への予約</h2>
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
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="font-semibold text-gray-900">{booking.room?.name || '部屋情報なし'}</h2>
                      <p className="text-sm text-gray-600">
                        {booking.guest?.firstName && booking.guest?.lastName
                          ? `${booking.guest.firstName} ${booking.guest.lastName}`
                          : booking.guestName}
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
                      <span className="font-medium">チェックイン:</span> {formatDate(booking.checkInDate)}
                    </div>
                    <div>
                      <span className="font-medium">チェックアウト:</span> {formatDate(booking.checkOutDate)}
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
              {bookings.length > 5 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  他{bookings.length - 5}件の予約があります
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 部屋作成モーダル */}
      {showCreateModal && (
        <CreateRoomModal
          propertyId={propertyId}
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
}

// 部屋作成モーダルコンポーネント
function CreateRoomModal({
  propertyId,
  onClose,
  onRoomCreated,
}: {
  propertyId: string;
  onClose: () => void;
  onRoomCreated: (room: Room) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    capacity: '2',
    bedType: '',
    pricePerNight: '',
    quantity: '1',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const newRoom = await apiClient.createRoom({
        propertyId,
        name: formData.name,
        description: formData.description || undefined,
        size: formData.size ? parseInt(formData.size) : undefined,
        capacity: parseInt(formData.capacity),
        bedType: formData.bedType || undefined,
        pricePerNight: parseInt(formData.pricePerNight),
        quantity: parseInt(formData.quantity),
      });
      onRoomCreated(newRoom);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '部屋の作成に失敗しました';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">部屋を追加</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={submitting}
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                rows={3}
                placeholder="部屋の説明を入力してください"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
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
                {submitting ? '作成中...' : '作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
