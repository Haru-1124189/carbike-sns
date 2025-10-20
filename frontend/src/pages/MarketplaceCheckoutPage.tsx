import { ArrowLeft, CreditCard, MapPin, Package, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useItem } from '../hooks/useMarketplace';

interface MarketplaceCheckoutPageProps {
  itemId?: string;
  item?: any;
  onBack?: () => void;
  onComplete?: () => void;
  onBackClick?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const MarketplaceCheckoutPage: React.FC<MarketplaceCheckoutPageProps> = ({
  itemId: propItemId,
  item: propItem,
  onBack,
  onComplete,
  onBackClick,
  onSuccess,
  onCancel
}) => {
  const { user, userDoc } = useAuth();
  const { item, loading: itemLoading } = useItem(propItemId || '');
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>('credit_card');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: '',
    phoneNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !item) return;

    setLoading(true);
    try {
      // Stripe決済処理
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003'}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: item.title,
          productPrice: item.price,
          productDescription: item.description,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      const sessionData = await response.json();
      
      if (response.ok) {
        // Stripe Checkoutページにリダイレクト
        window.location.href = sessionData.url;
      } else {
        throw new Error(sessionData.error || '決済セッションの作成に失敗しました');
      }
    } catch (error) {
      console.error('決済エラー:', error);
      alert(`決済処理でエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  if (itemLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">商品情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">商品が見つかりません</p>
          <button
            onClick={() => onBack?.()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const subtotal = item.price;
  const shipping = item.shipping.method === 'buyer_pays' ? (item.shipping.fee || 0) : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-gray-900 text-white z-10">
        <div className="flex items-center space-x-4 px-4 py-3">
          <button
            onClick={() => onBack?.()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">購入手続き</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: フォーム */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 配送先住所 */}
              <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-text-primary">配送先住所</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      お名前 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                      placeholder="山田太郎"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        郵便番号 *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                        placeholder="123-4567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        都道府県 *
                      </label>
                      <select
                        value={shippingAddress.prefecture}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, prefecture: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                        required
                      >
                        <option value="">選択してください</option>
                        <option value="北海道">北海道</option>
                        <option value="青森県">青森県</option>
                        <option value="岩手県">岩手県</option>
                        <option value="宮城県">宮城県</option>
                        <option value="秋田県">秋田県</option>
                        <option value="山形県">山形県</option>
                        <option value="福島県">福島県</option>
                        <option value="茨城県">茨城県</option>
                        <option value="栃木県">栃木県</option>
                        <option value="群馬県">群馬県</option>
                        <option value="埼玉県">埼玉県</option>
                        <option value="千葉県">千葉県</option>
                        <option value="東京都">東京都</option>
                        <option value="神奈川県">神奈川県</option>
                        <option value="新潟県">新潟県</option>
                        <option value="富山県">富山県</option>
                        <option value="石川県">石川県</option>
                        <option value="福井県">福井県</option>
                        <option value="山梨県">山梨県</option>
                        <option value="長野県">長野県</option>
                        <option value="岐阜県">岐阜県</option>
                        <option value="静岡県">静岡県</option>
                        <option value="愛知県">愛知県</option>
                        <option value="三重県">三重県</option>
                        <option value="滋賀県">滋賀県</option>
                        <option value="京都府">京都府</option>
                        <option value="大阪府">大阪府</option>
                        <option value="兵庫県">兵庫県</option>
                        <option value="奈良県">奈良県</option>
                        <option value="和歌山県">和歌山県</option>
                        <option value="鳥取県">鳥取県</option>
                        <option value="島根県">島根県</option>
                        <option value="岡山県">岡山県</option>
                        <option value="広島県">広島県</option>
                        <option value="山口県">山口県</option>
                        <option value="徳島県">徳島県</option>
                        <option value="香川県">香川県</option>
                        <option value="愛媛県">愛媛県</option>
                        <option value="高知県">高知県</option>
                        <option value="福岡県">福岡県</option>
                        <option value="佐賀県">佐賀県</option>
                        <option value="長崎県">長崎県</option>
                        <option value="熊本県">熊本県</option>
                        <option value="大分県">大分県</option>
                        <option value="宮崎県">宮崎県</option>
                        <option value="鹿児島県">鹿児島県</option>
                        <option value="沖縄県">沖縄県</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      市区町村 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                      placeholder="渋谷区"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      町名・番地 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address1}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                      placeholder="道玄坂1-2-3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      建物名・部屋番号
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address2}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                      placeholder="○○マンション 101号室"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      電話番号 *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phoneNumber}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                      placeholder="090-1234-5678"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 支払い方法 */}
              <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-text-primary">支払い方法</h2>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-border rounded-lg hover:bg-surface-light transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'bank_transfer')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-text-primary">クレジットカード</div>
                      <div className="text-sm text-text-secondary">Visa, MasterCard, JCB対応</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-border rounded-lg hover:bg-surface-light transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'bank_transfer')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-text-primary">銀行振込</div>
                      <div className="text-sm text-text-secondary">商品到着後に支払い</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 注文ボタン */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {loading ? '注文中...' : `¥${total.toLocaleString()}で注文する`}
              </button>
            </form>
          </div>

          {/* 右側: 注文内容 */}
          <div>
            <div className="bg-surface border border-border rounded-lg p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-text-primary">注文内容</h2>
              </div>
              
              {/* 商品情報 */}
              <div className="flex space-x-4 mb-4">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-text-secondary">カテゴリ: {item.category}</p>
                  <p className="text-sm text-text-secondary">状態: {item.condition}</p>
                </div>
              </div>
              
              {/* 価格詳細 */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">商品価格</span>
                  <span className="text-text-primary">¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">送料</span>
                  <span className="text-text-primary">
                    {shipping > 0 ? `¥${shipping.toLocaleString()}` : '無料'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span className="text-text-primary">合計</span>
                  <span className="text-primary">¥{total.toLocaleString()}</span>
                </div>
              </div>
              
              {/* セキュリティ情報 */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">安全な取引</span>
                </div>
                <p className="text-xs text-blue-700">
                  出品者認証済み・商品到着後の支払いも可能です
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
