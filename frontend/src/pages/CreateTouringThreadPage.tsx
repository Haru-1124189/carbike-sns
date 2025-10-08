import { ArrowLeft, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { createTouringThread, notifyNearbyUsers } from '../lib/touring';

interface CreateTouringThreadPageProps {
  onBack?: () => void;
  onSubmit?: (data: any) => void;
}

export const CreateTouringThreadPage: React.FC<CreateTouringThreadPageProps> = ({ onBack, onSubmit }) => {
  const { user, userDoc } = useAuth();
  
  const [formData, setFormData] = useState({
    description: '',
    prefecture: '',
    location: '',
    touringDate: '',
    touringTime: '',
    applicationDeadline: '',
    applicationDeadlineTime: '',
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 都道府県リスト
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('ログインが必要です');
      return;
    }

    // バリデーション
    if (!formData.description.trim()) {
      alert('ツーリングの内容を入力してください');
      return;
    }

    if (!formData.prefecture) {
      alert('都道府県を選択してください');
      return;
    }

    if (!formData.location.trim()) {
      alert('地名・場所を入力してください');
      return;
    }

    if (!formData.touringDate || !formData.touringTime) {
      alert('ツーリング日時を入力してください');
      return;
    }

    if (!formData.applicationDeadline || !formData.applicationDeadlineTime) {
      alert('募集締切を入力してください');
      return;
    }

    // 日時のバリデーション
    const touringDateTime = new Date(`${formData.touringDate}T${formData.touringTime}`);
    const deadlineDateTime = new Date(`${formData.applicationDeadline}T${formData.applicationDeadlineTime}`);
    const now = new Date();

    if (deadlineDateTime <= now) {
      alert('募集締切は現在時刻より後に設定してください');
      return;
    }

    if (deadlineDateTime >= touringDateTime) {
      alert('募集締切はツーリング日時より前に設定してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const touringThreadData = {
        title: formData.description.trim(), // 説明をタイトルとして使用
        description: formData.description.trim(),
        prefecture: formData.prefecture,
        location: formData.location.trim(),
        touringDate: touringDateTime.toISOString(),
        applicationDeadline: deadlineDateTime.toISOString(),
        // maxParticipantsフィールドを削除（undefinedはFirestoreでサポートされていない）
        tags: formData.tags,
        authorId: user.uid,
        authorName: userDoc?.displayName || user?.displayName || 'ユーザー',
        authorAvatar: userDoc?.photoURL || user?.photoURL || '',
        currentParticipants: 1,
        participants: [user.uid],
        replies: 0,
        likes: 0,
        status: 'active' as const
      };

      console.log('Submitting touring thread data:', touringThreadData);

      // Firestoreに保存
      const threadId = await createTouringThread(touringThreadData);
      console.log('Touring thread created with ID:', threadId);
      
      // 近くのユーザーに通知を送信
      try {
        const newThread = {
          id: threadId,
          ...touringThreadData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await notifyNearbyUsers(newThread);
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // 通知の失敗は投稿の成功を阻害しない
      }
      
      // 成功した場合は親コンポーネントに通知
      onSubmit?.(touringThreadData);
      
      alert('ツーリング募集を投稿しました！近くのユーザーに通知を送信しました。');
    } catch (error) {
      console.error('Error creating touring thread:', error);
      console.error('Full error object:', error);
      alert('投稿に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0 fade-in max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-3"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">ツーリング募集</h1>
        </div>

         <form onSubmit={handleSubmit} className="space-y-6">
           {/* 基本情報 */}
           <div className="space-y-4">
             <h3 className="text-lg font-medium text-white">基本情報</h3>

             {/* ツーリング内容 */}
             <div>
               <label className="block text-sm font-medium text-white mb-2">
                 ツーリング内容 *
               </label>
               <textarea
                 name="description"
                 value={formData.description}
                 onChange={handleInputChange}
                 placeholder="例: 10月8日12時から熊本県の阿蘇でツーリング行きましょうー！！"
                 rows={4}
                 className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                 maxLength={2000}
                 required
               />
               <p className="text-xs text-gray-400 mt-1">
                 {formData.description.length}/2000文字
               </p>
             </div>
           </div>

          {/* 場所情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">場所情報</h3>

            {/* 都道府県 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                都道府県 *
              </label>
              <select
                name="prefecture"
                value={formData.prefecture}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white focus:outline-none focus:border-primary"
                required
              >
                <option value="">都道府県を選択</option>
                {prefectures.map(prefecture => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
            </div>

            {/* 地名・場所 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                地名・場所 *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="具体的な地名や場所を入力してください"
                className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                required
                maxLength={100}
              />
            </div>
          </div>

          {/* 日時情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">日時情報</h3>

            {/* ツーリング日時 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  ツーリング日 *
                </label>
                <input
                  type="date"
                  name="touringDate"
                  value={formData.touringDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  ツーリング時間 *
                </label>
                <input
                  type="time"
                  name="touringTime"
                  value={formData.touringTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* 募集締切 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  募集締切日 *
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  募集締切時間 *
                </label>
                <input
                  type="time"
                  name="applicationDeadlineTime"
                  value={formData.applicationDeadlineTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
           </div>

           {/* タグ */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">タグ</h3>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                タグ (最大5個)
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="タグを入力"
                  className="flex-1 px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={formData.tags.length >= 5}
                  className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-primary text-white text-sm rounded-full"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 投稿ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>投稿中...</span>
              </>
            ) : (
              <>
                <Users size={20} />
                <span>ツーリングを募集</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};
