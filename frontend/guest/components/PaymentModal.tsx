'use client';

import { useState } from 'react';
import { PaymentMethod } from '@/lib/types';

// クレジットカード情報の型
interface CreditCardInfo {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  securityCode: string;
}

// Propsの型定義
interface PaymentModalProps {
  totalPrice: number;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod, cardLast4?: string) => void;
}

/**
 * 決済画面コンポーネント
 */
export default function PaymentModal({ totalPrice, onClose, onConfirm }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONSITE');
  const [creditCardInfo, setCreditCardInfo] = useState<CreditCardInfo>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cardholderName: '',
    securityCode: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreditCardInfo, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  /**
   * カード番号のフォーマット（4桁ごとにスペースを挿入）
   */
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  /**
   * カード番号の入力処理
   */
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCreditCardInfo({ ...creditCardInfo, cardNumber: value });
      setErrors({ ...errors, cardNumber: undefined });
    }
  };

  /**
   * カード名義人の入力処理（半角大文字アルファベットとスペースのみ）
   */
  const handleCardholderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, '');
    setCreditCardInfo({ ...creditCardInfo, cardholderName: value });
    setErrors({ ...errors, cardholderName: undefined });
  };

  /**
   * セキュリティコードの入力処理（3桁または4桁の数字）
   */
  const handleSecurityCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCreditCardInfo({ ...creditCardInfo, securityCode: value });
      setErrors({ ...errors, securityCode: undefined });
    }
  };

  /**
   * クレジットカード情報のバリデーション
   */
  const validateCreditCard = (): boolean => {
    const newErrors: Partial<Record<keyof CreditCardInfo, string>> = {};

    // カード番号のバリデーション（13〜19桁）
    if (!creditCardInfo.cardNumber) {
      newErrors.cardNumber = 'カード番号を入力してください';
    } else if (creditCardInfo.cardNumber.length < 13 || creditCardInfo.cardNumber.length > 19) {
      newErrors.cardNumber = 'カード番号は13〜19桁である必要があります';
    }

    // 有効期限のバリデーション
    if (!creditCardInfo.expiryMonth || !creditCardInfo.expiryYear) {
      newErrors.expiryMonth = '有効期限を入力してください';
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expiryYear = parseInt(creditCardInfo.expiryYear);
      const expiryMonth = parseInt(creditCardInfo.expiryMonth);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiryMonth = '有効期限が過去の日付です';
      }
    }

    // カード名義人のバリデーション（半角大文字アルファベットとスペースのみ）
    if (!creditCardInfo.cardholderName) {
      newErrors.cardholderName = 'カード名義人を入力してください';
    } else if (!/^[A-Z\s]+$/.test(creditCardInfo.cardholderName)) {
      newErrors.cardholderName = 'カード名義人は半角大文字アルファベットで入力してください';
    }

    // セキュリティコードのバリデーション（3桁または4桁）
    if (!creditCardInfo.securityCode) {
      newErrors.securityCode = 'セキュリティコードを入力してください';
    } else if (creditCardInfo.securityCode.length < 3 || creditCardInfo.securityCode.length > 4) {
      newErrors.securityCode = 'セキュリティコードは3桁または4桁である必要があります';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 決済処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setSubmitting(true);

    try {
      // 現地払いの場合はそのまま確定
      if (paymentMethod === 'ONSITE') {
        onConfirm('ONSITE');
        return;
      }

      // クレジットカード払いの場合はバリデーション
      if (!validateCreditCard()) {
        setSubmitting(false);
        return;
      }

      // 末尾9999のカードはエラー
      if (creditCardInfo.cardNumber.endsWith('9999')) {
        setPaymentError('このカードは利用できません。別のカードをお試しください。');
        setSubmitting(false);
        return;
      }

      // 決済成功（Stripe連携は将来実装）
      const cardLast4 = creditCardInfo.cardNumber.slice(-4);
      onConfirm('CREDIT_CARD', cardLast4);
    } catch (error: any) {
      setPaymentError(error.message || '決済処理に失敗しました');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">決済情報入力</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={submitting}
            >
              ✕
            </button>
          </div>

          {/* 料金表示 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">合計金額</span>
              <span className="text-3xl font-bold text-blue-600">
                ¥{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {paymentError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {paymentError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 支払い方法選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                支払い方法 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {/* 現地払い */}
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{ borderColor: paymentMethod === 'ONSITE' ? '#3b82f6' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONSITE"
                    checked={paymentMethod === 'ONSITE'}
                    onChange={() => setPaymentMethod('ONSITE')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">現地払い</div>
                    <div className="text-sm text-gray-500">チェックイン時にお支払いください</div>
                  </div>
                </label>

                {/* クレジットカード */}
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{ borderColor: paymentMethod === 'CREDIT_CARD' ? '#3b82f6' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={() => setPaymentMethod('CREDIT_CARD')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">クレジットカード</div>
                    <div className="text-sm text-gray-500">Stripeで安全に決済</div>
                  </div>
                </label>
              </div>
            </div>

            {/* クレジットカード情報入力フォーム */}
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">Stripe決済（テスト環境）</span>
                </div>

                {/* カード番号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カード番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formatCardNumber(creditCardInfo.cardNumber)}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                {/* 有効期限 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      有効期限 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={creditCardInfo.expiryMonth}
                        onChange={(e) => {
                          setCreditCardInfo({ ...creditCardInfo, expiryMonth: e.target.value });
                          setErrors({ ...errors, expiryMonth: undefined });
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.expiryMonth ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">月</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <select
                        value={creditCardInfo.expiryYear}
                        onChange={(e) => {
                          setCreditCardInfo({ ...creditCardInfo, expiryYear: e.target.value });
                          setErrors({ ...errors, expiryMonth: undefined });
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.expiryMonth ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">年</option>
                        {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.expiryMonth && (
                      <p className="text-xs text-red-500 mt-1">{errors.expiryMonth}</p>
                    )}
                  </div>

                  {/* セキュリティコード */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      セキュリティコード <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={creditCardInfo.securityCode}
                      onChange={handleSecurityCodeChange}
                      placeholder="123"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.securityCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      maxLength={4}
                    />
                    {errors.securityCode && (
                      <p className="text-xs text-red-500 mt-1">{errors.securityCode}</p>
                    )}
                  </div>
                </div>

                {/* カード名義人 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カード名義人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={creditCardInfo.cardholderName}
                    onChange={handleCardholderNameChange}
                    placeholder="TARO YAMADA"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">半角大文字アルファベットで入力してください</p>
                  {errors.cardholderName && (
                    <p className="text-xs text-red-500 mt-1">{errors.cardholderName}</p>
                  )}
                </div>
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                戻る
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                disabled={submitting}
              >
                {submitting ? '処理中...' : paymentMethod === 'ONSITE' ? '予約を確定' : 'Stripeで決済'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
