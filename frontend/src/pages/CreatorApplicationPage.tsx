import { ArrowLeft, Instagram, MessageCircle, Twitter, Video, Youtube } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { useCreatorApplication } from '../hooks/useCreatorApplication';

interface CreatorApplicationPageProps {
  onBackClick?: () => void;
  onNavigate?: (screen: string) => void;
}

export const CreatorApplicationPage: React.FC<CreatorApplicationPageProps> = ({ 
  onBackClick, 
  onNavigate 
}) => {
  const { user } = useAuth();
  const { userApplication, createApplication, loading, error } = useCreatorApplication(user?.uid);

  type FormData = {
    channelName: string;
    channelDescription: string;
    contentCategory: 'car_review' | 'maintenance' | 'racing' | 'custom' | 'news' | 'other';
    experience: string;
    motivation: string;
    socialMediaLinks: {
      youtube: string;
      instagram: string;
      twitter: string;
      tiktok: string;
    };
  };

  const [formData, setFormData] = useState<FormData>({
    channelName: '',
    channelDescription: '',
    contentCategory: 'car_review',
    experience: '',
    motivation: '',
    socialMediaLinks: {
      youtube: '',
      instagram: '',
      twitter: '',
      tiktok: '',
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const contentCategories = [
    { value: 'car_review', label: '車両レビュー' },
    { value: 'maintenance', label: '整備・メンテナンス' },
    { value: 'racing', label: 'レーシング・走行' },
    { value: 'custom', label: 'カスタム・改造' },
    { value: 'news', label: 'ニュース・情報' },
    { value: 'other', label: 'その他' },
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'socialMediaLinks') {
        setFormData(prev => ({
          ...prev,
          socialMediaLinks: {
            ...prev.socialMediaLinks,
            [child]: value,
          },
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    try {
      await createApplication(formData);
      setShowSuccess(true);
      setTimeout(() => {
        onBackClick?.();
      }, 2000);
    } catch (err: any) {
      alert(err.message || '申請の送信に失敗しました');
    }
  };

  // 既に申請がある場合
  if (userApplication) {
    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending': return '審査中';
        case 'approved': return '承認済み';
        case 'rejected': return '却下';
        default: return '不明';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'text-yellow-400';
        case 'approved': return 'text-green-400';
        case 'rejected': return 'text-red-400';
        default: return 'text-gray-400';
      }
    };

    return (
      <div className="min-h-screen bg-background container-mobile">
        <AppHeader 
          onNotificationClick={() => console.log('Notifications clicked')}
          onProfileClick={() => console.log('Profile clicked')}
        />
        
        
        <main className="p-4 pb-24">
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">動画配信申請</h1>
          </div>

          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Video size={24} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">申請状況</h2>
              <p className="text-gray-400 text-sm">
                あなたの動画配信申請の状況です
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">チャンネル名</span>
                  <span className={`text-sm font-bold ${getStatusColor(userApplication.status)}`}>
                    {getStatusText(userApplication.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{userApplication.channelName}</p>
              </div>

              <div className="bg-surface-light rounded-lg p-4">
                <span className="text-sm font-medium text-white block mb-2">チャンネル説明</span>
                <p className="text-sm text-gray-300">{userApplication.channelDescription}</p>
              </div>

              <div className="bg-surface-light rounded-lg p-4">
                <span className="text-sm font-medium text-white block mb-2">コンテンツカテゴリ</span>
                <p className="text-sm text-gray-300">
                  {contentCategories.find(cat => cat.value === userApplication.contentCategory)?.label}
                </p>
              </div>

              {userApplication.adminNotes && (
                <div className="bg-surface-light rounded-lg p-4">
                  <span className="text-sm font-medium text-white block mb-2">管理者からのコメント</span>
                  <p className="text-sm text-gray-300">{userApplication.adminNotes}</p>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center">
                申請日: {userApplication.createdAt?.toDate?.()?.toLocaleDateString('ja-JP') || '不明'}
              </div>
            </div>

            {userApplication.status === 'rejected' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  再申請する
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // 申請フォーム
  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader 
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
      
      
              <main className="p-4 pb-24">
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">動画配信申請</h1>
        </div>

        {showSuccess ? (
          <div className="bg-surface rounded-xl border border-surface-light p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">申請を送信しました</h2>
            <p className="text-gray-400 text-sm">
              審査結果は後日お知らせします
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-surface rounded-xl border border-surface-light p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video size={24} className="text-white" />
                </div>
                                 <h2 className="text-lg font-bold text-white mb-2">クリエイター申請</h2>
                 <p className="text-gray-400 text-sm">
                   動画配信機能を利用するための申請です
                 </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* チャンネル名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    チャンネル名 *
                  </label>
                  <input
                    type="text"
                    value={formData.channelName}
                    onChange={(e) => handleInputChange('channelName', e.target.value)}
                    placeholder="チャンネル名を入力"
                    maxLength={50}
                    required
                    className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {formData.channelName.length}/50文字
                    </span>
                  </div>
                </div>

                {/* チャンネル説明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    チャンネル説明 *
                  </label>
                  <textarea
                    value={formData.channelDescription}
                    onChange={(e) => handleInputChange('channelDescription', e.target.value)}
                    placeholder="チャンネルの内容や特徴を説明してください"
                    maxLength={200}
                    rows={3}
                    required
                    className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {formData.channelDescription.length}/200文字
                    </span>
                  </div>
                </div>

                {/* コンテンツカテゴリ */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    コンテンツカテゴリ *
                  </label>
                  <select
                    value={formData.contentCategory}
                    onChange={(e) => handleInputChange('contentCategory', e.target.value)}
                    required
                    className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                  >
                    {contentCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 経験・実績 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    経験・実績 *
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="車・バイクに関する経験や実績を教えてください"
                    maxLength={300}
                    rows={3}
                    required
                    className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {formData.experience.length}/300文字
                    </span>
                  </div>
                </div>

                {/* 動機 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    動機 *
                  </label>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    placeholder="動画配信を始めたい理由や目標を教えてください"
                    maxLength={300}
                    rows={3}
                    required
                    className="w-full bg-transparent border border-surface-light rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {formData.motivation.length}/300文字
                    </span>
                  </div>
                </div>

                {/* SNSリンク */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ソーシャルメディア（任意）
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Youtube size={16} className="text-red-400" />
                      <input
                        type="url"
                        value={formData.socialMediaLinks.youtube}
                        onChange={(e) => handleInputChange('socialMediaLinks.youtube', e.target.value)}
                        placeholder="YouTubeチャンネルURL"
                        className="flex-1 bg-transparent border border-surface-light rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Instagram size={16} className="text-pink-400" />
                      <input
                        type="url"
                        value={formData.socialMediaLinks.instagram}
                        onChange={(e) => handleInputChange('socialMediaLinks.instagram', e.target.value)}
                        placeholder="InstagramアカウントURL"
                        className="flex-1 bg-transparent border border-surface-light rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Twitter size={16} className="text-blue-400" />
                      <input
                        type="url"
                        value={formData.socialMediaLinks.twitter}
                        onChange={(e) => handleInputChange('socialMediaLinks.twitter', e.target.value)}
                        placeholder="TwitterアカウントURL"
                        className="flex-1 bg-transparent border border-surface-light rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.channelName || !formData.channelDescription || !formData.experience || !formData.motivation}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '送信中...' : '申請を送信'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
