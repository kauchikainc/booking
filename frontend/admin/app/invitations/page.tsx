'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Invitation, CreateInvitationRequest, InvitationStatus } from '@/lib/types';
import Link from 'next/link';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // フォーム状態
  const [email, setEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フィルター状態
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'ALL'>('ALL');

  // 招待一覧を取得
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await apiClient.getInvitations(status);
      setInvitations(response.invitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : '招待一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [statusFilter]);

  // 招待を作成
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const data: CreateInvitationRequest = {
        email: email.trim(),
        role: 'OWNER', // 施設オーナー専用
        expiresInDays,
      };

      await apiClient.createInvitation(data);

      setSuccessMessage(`${email} に招待を送信しました`);
      setEmail('');
      setExpiresInDays(7);

      // 招待一覧を再取得
      await fetchInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : '招待の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 招待を削除
  const handleDeleteInvitation = async (id: string) => {
    if (!confirm('この招待を削除してもよろしいですか?')) {
      return;
    }

    try {
      setError(null);
      await apiClient.deleteInvitation(id);
      setSuccessMessage('招待を削除しました');
      await fetchInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : '招待の削除に失敗しました');
    }
  };

  // トークンをコピー
  const handleCopyToken = (token: string) => {
    const invitationUrl = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(invitationUrl);
    setSuccessMessage('招待URLをコピーしました');
  };

  // ステータスバッジの色を取得
  const getStatusColor = (status: InvitationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスラベルを取得
  const getStatusLabel = (status: InvitationStatus) => {
    switch (status) {
      case 'PENDING':
        return '招待中';
      case 'ACCEPTED':
        return '承認済み';
      case 'EXPIRED':
        return '期限切れ';
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
              <Link href="/users" className="text-gray-300 hover:text-white">
                ユーザー管理
              </Link>
              <Link href="/properties" className="text-gray-300 hover:text-white">
                施設管理
              </Link>
              <Link href="/bookings" className="text-gray-300 hover:text-white">
                予約管理
              </Link>
              <Link href="/invitations" className="text-white font-semibold">
                招待管理
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">招待管理</h2>

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

        {/* 招待作成フォーム */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">新しい招待を作成</h2>
          <form onSubmit={handleCreateInvitation} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="owner@example.com"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                施設オーナーとして招待されます
              </p>
            </div>

            <div>
              <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 mb-1">
                有効期限（日数）
              </label>
              <input
                type="number"
                id="expiresInDays"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10))}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '作成中...' : '招待を作成'}
            </button>
          </form>
        </div>

        {/* 招待一覧 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">招待一覧</h2>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvitationStatus | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">すべて</option>
              <option value="PENDING">招待中</option>
              <option value="ACCEPTED">承認済み</option>
              <option value="EXPIRED">期限切れ</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">招待はありません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      有効期限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invitation.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                          {getStatusLabel(invitation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invitation.expiresAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invitation.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {invitation.status === 'PENDING' && (
                          <button
                            onClick={() => handleCopyToken(invitation.token)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            URLをコピー
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
