'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  // フォーム状態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 招待トークンを検証
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('招待トークンが指定されていません');
        setIsValidating(false);
        return;
      }

      try {
        const invitation = await apiClient.validateInvitationToken(token);
        setInvitationEmail(invitation.email);
        setExpiresAt(invitation.expiresAt);
        setEmail(invitation.email);
        setIsValidating(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '招待トークンが無効です');
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // 登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('パスワードは小文字、大文字、数字を含む必要があります');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (!companyName.trim()) {
      setError('会社名を入力してください');
      return;
    }

    if (!businessLicense.trim()) {
      setError('事業許可番号を入力してください');
      return;
    }

    if (!phone.trim()) {
      setError('電話番号を入力してください');
      return;
    }

    if (!token) {
      setError('招待トークンが見つかりません');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await apiClient.registerOwner({
        email: email.trim(),
        password,
        companyName: companyName.trim(),
        businessLicense: businessLicense.trim(),
        phone: phone.trim(),
        invitationToken: token,
      });

      // 登録成功後、ダッシュボードにリダイレクト
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-lg text-gray-600">招待トークンを検証中...</div>
        </div>
      </div>
    );
  }

  if (!token || (error && !invitationEmail)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">エラー</h2>
          <p className="text-gray-700 mb-6">{error || '無効な招待トークンです'}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">オーナー登録</h2>
          <p className="mt-2 text-sm text-gray-600">
            招待メールアドレス: <span className="font-semibold">{invitationEmail}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            有効期限: {new Date(expiresAt).toLocaleString('ja-JP')}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">招待されたメールアドレスのみ使用できます</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="8文字以上、大小英数字を含む"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認）
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="もう一度入力してください"
                required
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                会社名
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="株式会社サンプル"
                required
              />
            </div>

            <div>
              <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-1">
                事業許可番号
              </label>
              <input
                type="text"
                id="businessLicense"
                value={businessLicense}
                onChange={(e) => setBusinessLicense(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="LICENSE-12345"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="03-1234-5678"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '登録中...' : '登録する'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちですか?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                ログイン
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
