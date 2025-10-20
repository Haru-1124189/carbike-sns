import { ArrowLeft, Building2, FileText, Mail, MapPin } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useShopApplication } from '../hooks/useShopApplication';
import { ShopApplicationData } from '../types/user';

interface ShopApplicationPageProps {
  onBackClick?: () => void;
}

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export const ShopApplicationPage: React.FC<ShopApplicationPageProps> = ({ onBackClick }) => {
  const { user } = useAuth();
  const { submitApplication, loading, error } = useShopApplication();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ShopApplicationData>({
    shopName: '',
    businessLicense: '',
    taxId: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    businessAddress: {
      prefecture: '',
      city: '',
      address: '',
      postalCode: ''
    },
    businessDescription: '',
    reasonForApplication: ''
  });

  const handleInputChange = (field: keyof ShopApplicationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: keyof typeof formData.businessAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // バリデーション
      if (!formData.shopName.trim()) {
        throw new Error('屋号・店舗名を入力してください');
      }
      if (!formData.contactEmail.trim()) {
        throw new Error('連絡先メールアドレスを入力してください');
      }
      if (!formData.businessAddress.prefecture) {
        throw new Error('都道府県を選択してください');
      }
      if (!formData.businessAddress.city.trim()) {
        throw new Error('市区町村を入力してください');
      }
      if (!formData.businessAddress.address.trim()) {
        throw new Error('住所を入力してください');
      }
      if (!formData.businessDescription.trim()) {
        throw new Error('事業内容説明を入力してください');
      }

      // Firebase Functionsに申請データを送信
      await submitApplication(formData);
      setSuccess(true);

    } catch (err: any) {
      // エラーはHookで管理されているので、ここでは何もしない
      console.error('申請エラー:', err);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[420px] mx-auto">
          <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-[420px] mx-auto w-full flex items-center justify-center p-4">
              <span className="text-base text-text-primary font-medium">Shop申請完了</span>
            </div>
          </header>

          <main className="px-4 py-8">
            <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white mb-4">申請が完了しました</h1>
              <p className="text-text-secondary mb-6">
                申請内容を審査いたします。審査結果はメールにてお知らせいたします。<br />
                審査には数営業日かかる場合があります。
              </p>
              <button
                onClick={onBackClick}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                戻る
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[420px] mx-auto w-full flex items-center justify-between p-4">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <span className="text-base text-text-primary font-medium">Shop申請</span>
            <div className="w-10" /> {/* スペーサー */}
          </div>
        </header>

        <main className="px-4 py-8">
          <div className="bg-surface rounded-xl border border-surface-light p-6 shadow-sm mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Shop申請</h1>
                <p className="text-sm text-text-secondary">ネット販売事業者として登録申請</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary">
              ネット販売を行うためには、法的要件を満たす必要があります。<br />
              以下の情報をご記入ください。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報 */}
            <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Building2 size={20} className="mr-2" />
                基本情報
              </h2>

              {/* 屋号・店舗名 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  屋号・店舗名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => handleInputChange('shopName', e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="例: 株式会社○○、○○商店"
                  required
                />
              </div>

              {/* 事業許可番号 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  事業許可番号
                </label>
                <input
                  type="text"
                  value={formData.businessLicense}
                  onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="古物商許可番号など（任意）"
                />
              </div>

              {/* 税務署届出番号 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  税務署届出番号
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="T1234567890123（任意）"
                />
              </div>
            </div>

            {/* 連絡先情報 */}
            <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Mail size={20} className="mr-2" />
                連絡先情報
              </h2>

              {/* 連絡先メール */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  連絡先メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="contact@example.com"
                  required
                />
              </div>

              {/* 連絡先電話番号 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  連絡先電話番号
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="03-1234-5678（任意）"
                />
              </div>
            </div>

            {/* 事業所住所 */}
            <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MapPin size={20} className="mr-2" />
                事業所住所
              </h2>

              {/* 都道府県 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  都道府県 <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.businessAddress.prefecture}
                  onChange={(e) => handleAddressChange('prefecture', e.target.value)}
                  className="w-full bg-surface border border-surface-light rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
              </div>

              {/* 市区町村 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  市区町村 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="例: 渋谷区"
                  required
                />
              </div>

              {/* 郵便番号 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  郵便番号
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="例: 150-0002"
                />
              </div>

              {/* 住所 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  住所 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                  className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  placeholder="例: 恵比寿1-2-3 ビル4階"
                  required
                />
              </div>
            </div>

            {/* 事業内容・申請理由 */}
            <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText size={20} className="mr-2" />
                事業内容・申請理由
              </h2>

              {/* 事業内容説明 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  事業内容説明 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  className="w-full h-32 bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                  placeholder="どのような商品を販売予定か、事業の詳細を教えてください"
                  required
                />
              </div>

              {/* 申請理由 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  申請理由 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.reasonForApplication}
                  onChange={(e) => handleInputChange('reasonForApplication', e.target.value)}
                  className="w-full h-32 bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                  placeholder="なぜShop申請をしたいのか、理由を教えてください"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '申請中...' : '申請を送信'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};
