import { Camera, HelpCircle, Plus, Video, Wrench } from 'lucide-react';
import React from 'react';
import { MotoIcon } from '../components/icons/MotoIcon';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { SectionTitle } from '../components/ui/SectionTitle';
import { postTemplates } from '../data/dummy';

interface PostPageProps {
  onCreatePost?: (postType: string) => void;
}

export const PostPage: React.FC<PostPageProps> = ({ onCreatePost }) => {
  const handlePostTemplate = (templateId: string) => {
    console.log('Post template clicked:', templateId);
    onCreatePost?.(templateId);
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader 
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
        
             <main className="p-4 pb-24 pt-0 fade-in">
        <SectionTitle title="投稿" />
        
                 {/* 投稿テンプレート */}
         <div className="space-y-4 fade-in">
           {postTemplates.map((template) => {
            const getIcon = (iconName: string) => {
              switch (iconName) {
                case 'Car':
                  return <MotoIcon size={24} />;
                case 'Camera':
                  return <Camera size={24} />;
                case 'HelpCircle':
                  return <HelpCircle size={24} />;
                case 'Video':
                  return <Video size={24} />;
                case 'Wrench':
                  return <Wrench size={24} />;
                default:
                  return <Plus size={24} />;
              }
            };

            return (
                             <div
                 key={template.id}
                 onClick={() => handlePostTemplate(template.id)}
                 className="bg-surface rounded-xl border border-surface-light p-4 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm"
               >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center text-primary">
                    {getIcon(template.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-1">{template.title}</h3>
                    <p className="text-xs text-gray-400">{template.description}</p>
                  </div>
                  <Plus size={20} className="text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

                 {/* 最近の投稿例 */}
         <div className="mt-8 fade-in">
           <SectionTitle title="最近の投稿例" />
           <div className="space-y-3">
             <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <MotoIcon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white mb-1">S13のエンジン音</h3>
                  <p className="text-xs text-gray-400 mb-2">今日はS13のエンジン音を録音してみました。アイドル音が最高です！</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>💬 8</span>
                    <span>❤️ 15</span>
                    <span>2時間前</span>
                  </div>
                </div>
              </div>
            </div>
            
                         <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Wrench size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white mb-1">EK9整備完了</h3>
                  <p className="text-xs text-gray-400 mb-2">EK9のオイル交換とタイヤローテーション完了！次はサスペンション調整予定</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
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
         <div className="mt-8 fade-in">
          <SectionTitle title="投稿のヒント" />
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-4 text-white shadow-lg hover:scale-[1.02] transition-all duration-300">
            <h3 className="text-sm font-bold mb-2">🏁 車・バイク愛好家のための投稿</h3>
            <ul className="text-xs space-y-1 opacity-90">
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
