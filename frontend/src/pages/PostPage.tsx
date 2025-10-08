import { Camera, HelpCircle, MessageSquare, Plus, Users, Video, Wrench } from 'lucide-react';
import React from 'react';
import { MotoIcon } from '../components/icons/MotoIcon';
import { postTemplates } from '../data/dummy';

interface PostPageProps {
  onCreatePost?: (postType: string) => void;
  onTouringChatClick?: () => void;
}

export const PostPage: React.FC<PostPageProps> = ({ onCreatePost, onTouringChatClick }) => {
  const handlePostTemplate = (templateId: string) => {
    console.log('Post template clicked:', templateId);
    
    if (templateId === 'touring') {
      onTouringChatClick?.();
    } else {
      onCreatePost?.(templateId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-6 sm:mb-8">投稿</h1>
        
                 {/* 投稿テンプレート */}
         <div className="space-y-4 fade-in">
           {postTemplates.map((template) => {
            const getIcon = (iconName: string, templateId: string) => {
              // クイックアクションと同じアイコンを使用
              switch (templateId) {
                case 'general':
                  return <MessageSquare size={24} />;
                case 'question':
                  return <HelpCircle size={24} />;
                case 'maintenance':
                  return <Wrench size={24} />;
                case 'touring':
                  return <Users size={24} />;
                default:
                  // フォールバック
                  switch (iconName) {
                    case 'Camera':
                      return <Camera size={24} />;
                    case 'Video':
                      return <Video size={24} />;
                    default:
                      return <Plus size={24} />;
                  }
              }
            };

            return (
              <button
                key={template.id}
                onClick={() => handlePostTemplate(template.id)}
                className="w-full p-4 sm:p-6 hover:bg-surface-light rounded-lg transition-colors text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-border flex items-center justify-center text-text-primary bg-transparent">
                    {getIcon(template.icon, template.id)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-text-primary mb-1">{template.title}</h3>
                    <p className="text-sm text-text-secondary">{template.description}</p>
                  </div>
                  <Plus size={20} className="text-text-secondary" />
                </div>
              </button>
            );
          })}
        </div>

                 {/* 最近の投稿例 */}
         <div className="mt-8 fade-in">
           <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4 sm:mb-6">最近の投稿例</h2>
           <div className="space-y-3">
             <div className="p-4 hover:bg-surface-light rounded-lg transition-colors">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <MotoIcon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary mb-1">S13のエンジン音</h3>
                  <p className="text-sm text-text-secondary mb-2">今日はS13のエンジン音を録音してみました。アイドル音が最高です！</p>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span>💬 8</span>
                    <span>❤️ 15</span>
                    <span>2時間前</span>
                  </div>
                </div>
              </div>
            </div>
            
             <div className="p-4 hover:bg-surface-light rounded-lg transition-colors">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Wrench size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary mb-1">EK9整備完了</h3>
                  <p className="text-sm text-text-secondary mb-2">EK9のオイル交換とタイヤローテーション完了！次はサスペンション調整予定</p>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span>💬 3</span>
                    <span>❤️ 7</span>
                    <span>5時間前</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

                 {/* 投稿のヒント */}
         <div className="mt-8 mb-8 fade-in">
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4 sm:mb-6">投稿のヒント</h2>
          <div className="p-4 sm:p-6 bg-surface-light rounded-lg">
            <h3 className="text-base font-semibold text-text-primary mb-3">🏁 車・バイク愛好家のための投稿</h3>
            <ul className="text-sm space-y-2 text-text-secondary">
              <li>• 愛車の写真や動画をシェア</li>
              <li>• 整備記録やメンテナンス情報</li>
              <li>• ツーリングやイベントの報告</li>
              <li>• パーツやカスタムの質問</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};
