import { ArrowLeft, Bell, Car, FileText, HelpCircle, Palette, Shield, Upload, User } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';
import { useAuth } from '../hooks/useAuth';

interface SettingsPageProps {
  onBackClick?: () => void;
  onNavigate?: (screen: string) => void;
  onLoginClick?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBackClick, onNavigate, onLoginClick }) => {
  const { userDoc } = useAuth();
  
  const [notifications, setNotifications] = useState({
    likes: true,
    replies: true,
    maintenance: false,
    follows: true
  });

  const [darkMode, setDarkMode] = useState(true);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const creatorSection = {
    title: "クリエイター",
    icon: Upload,
    items: [
      {
        id: 'creatorUpload',
        title: 'コンテンツアップロード',
        description: '動画や画像コンテンツをアップロード',
        type: 'action'
      }
    ]
  };

  const settingsSections = [
    ...(userDoc?.role === 'creator' ? [creatorSection] : []),
    {
      title: "通知設定",
      icon: Bell,
      items: [
        {
          id: 'likes',
          title: 'いいね通知',
          description: '投稿へのいいねを通知',
          type: 'toggle',
          value: notifications.likes
        },
        {
          id: 'replies',
          title: '返信通知',
          description: '質問への返信を通知',
          type: 'toggle',
          value: notifications.replies
        },
        {
          id: 'maintenance',
          title: '整備リマインダー',
          description: '車両の整備時期を通知',
          type: 'toggle',
          value: notifications.maintenance
        },
        {
          id: 'follows',
          title: 'フォロー通知',
          description: '新しいフォロワーを通知',
          type: 'toggle',
          value: notifications.follows
        }
      ]
    },
    {
      title: "アプリ設定",
      icon: Palette,
      items: [
        {
          id: 'darkMode',
          title: 'ダークモード',
          description: 'ダークテーマを使用',
          type: 'toggle',
          value: darkMode
        },
        {
          id: 'language',
          title: '言語',
          description: '日本語',
          type: 'select'
        }
      ]
    },
    {
      title: "サポート",
      icon: HelpCircle,
      items: [
        {
          id: 'contact',
          title: 'お問い合わせ',
          description: 'ご意見・ご要望・不具合の連絡',
          type: 'action'
        },
        {
          id: 'help',
          title: 'ヘルプ / FAQ',
          description: '使い方やよくある質問',
          type: 'action'
        },
        {
          id: 'report',
          title: '問題を報告',
          description: '違反報告やバグ報告',
          type: 'action'
        }
      ]
    },
    {
      title: "セーフティ",
      icon: Shield,
      items: [
        {
          id: 'blocklist',
          title: 'ブロックしたユーザー',
          description: 'ブロック中のユーザー一覧',
          type: 'action'
        },
        {
          id: 'mutedWords',
          title: 'ミュートワード',
          description: '表示しないキーワードを管理',
          type: 'action'
        }
      ]
    },
    {
      title: "ポリシー",
      icon: FileText,
      items: [
        {
          id: 'terms',
          title: '利用規約',
          description: 'サービスのご利用条件',
          type: 'action'
        },
        {
          id: 'privacy',
          title: 'プライバシーポリシー',
          description: '個人情報の取り扱い',
          type: 'action'
        },
        {
          id: 'about',
          title: 'このアプリについて',
          description: 'RevLink の概要',
          type: 'action'
        }
      ]
    },
    {
      title: "車両設定",
      icon: Car,
      items: [
        {
          id: 'addVehicle',
          title: '車両を追加',
          description: '新しい車両を登録',
          type: 'action'
        },
        {
          id: 'maintenance',
          title: '整備スケジュール',
          description: '整備予定を管理',
          type: 'action'
        }
      ]
    },
    {
      title: "アカウント",
      icon: User,
      items: [
        {
          id: 'profile',
          title: 'プロフィール編集',
          description: 'プロフィール情報を変更',
          type: 'action'
        },
        {
          id: 'privacy',
          title: 'プライバシー設定',
          description: 'プライバシーを管理',
          type: 'action'
        },
        {
          id: 'logout',
          title: 'ログアウト',
          description: '現在のアカウントからサインアウト',
          type: 'action'
        },
        {
          id: 'deleteAccount',
          title: 'アカウント削除',
          description: 'アカウントとデータを完全に削除',
          type: 'action'
        }
      ]
    }
  ];

  const handleSettingClick = (sectionTitle: string, itemId: string) => {
    if (itemId === 'likes' || itemId === 'replies' || itemId === 'maintenance' || itemId === 'follows') {
      toggleNotification(itemId as keyof typeof notifications);
    } else if (itemId === 'darkMode') {
      setDarkMode(!darkMode);
    } else {
      if (itemId === 'logout') {
        if (window.confirm('ログアウトしますか？')) {
          onLoginClick?.();
        }
        return;
      }
      if (itemId === 'deleteAccount') {
        if (window.confirm('アカウントを削除しますか？この操作は元に戻せません。')) {
          alert('アカウントを削除しました（ダミー）');
        }
        return;
      }
      onNavigate?.(itemId);
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader 
        user={{ id: "1", name: "RevLinkユーザー", avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U", cars: [], interestedCars: [] }}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
      
      <BannerAd />
      
      <main className="p-4 pb-20">
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">設定</h1>
        </div>

        <div className="space-y-6">
          {settingsSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div key={section.title}>
                <div className="flex items-center space-x-2 mb-4">
                  <IconComponent size={20} className="text-primary" />
                  <h2 className="text-sm font-bold text-white">{section.title}</h2>
                </div>
                
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSettingClick(section.title, item.id)}
                      className="bg-surface rounded-xl border border-surface-light p-4 cursor-pointer hover:scale-95 active:scale-95 transition-transform shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                        
                        {item.type === 'toggle' && 'value' in item && (
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${
                            item.value ? 'bg-primary' : 'bg-gray-600'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              item.value ? 'right-0.5' : 'left-0.5'
                            }`}></div>
                          </div>
                        )}
                        
                        {item.type === 'select' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{item.description}</span>
                            <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                          </div>
                        )}
                        
                        {item.type === 'action' && (
                          <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* アプリ情報 */}
        <div className="mt-8 pt-6 border-t border-surface-light">
          <div className="text-center">
            <h3 className="text-sm font-bold text-white mb-2">RevLink</h3>
            <p className="text-xs text-gray-400">Version 1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">車・バイク愛好家のためのSNS</p>
          </div>
        </div>
      </main>
    </div>
  );
};
