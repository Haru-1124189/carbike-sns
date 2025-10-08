import { ArrowLeft, FileText, HelpCircle, Palette, Shield, Upload, User } from 'lucide-react';
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface SettingsPageProps {
  onBackClick?: () => void;
  onNavigate?: (screen: string) => void;
  onLoginClick?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBackClick, onNavigate, onLoginClick }) => {
  const { userDoc } = useAuth();
  
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

  const adminSection = {
    title: "管理者",
    icon: Shield,
    items: [
      {
        id: 'adminDashboard',
        title: '管理者ダッシュボード',
        description: 'システム全体の管理と統計',
        type: 'action'
      },
      {
        id: 'adminApplications',
        title: '動画配信申請管理',
        description: '動画配信権限の申請を管理',
        type: 'action'
      }
    ]
  };

  const settingsSections = [
    ...(userDoc?.isAdmin ? [adminSection] : []),
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
    },
    {
      title: "アプリ設定",
      icon: Palette,
      items: [
        {
          id: 'theme',
          title: 'テーマ設定',
          description: '紺色・ダーク・ライトから選択',
          type: 'action'
        },
        {
          id: 'language',
          title: '言語',
          description: '日本語',
          type: 'select'
        }
      ]
    },
    ...(userDoc?.role === 'creator' ? [creatorSection] : []),
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
    }
  ];

  const handleSettingClick = (sectionTitle: string, itemId: string) => {
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
    if (itemId === 'theme') {
      onNavigate?.('theme');
      return;
    }
    if (itemId === 'privacy') {
      onNavigate?.('privacySettings');
      return;
    }
    onNavigate?.(itemId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* ヘッダー */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-surface-light rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">設定</h1>
        </div>

        <div className="space-y-12">
          {settingsSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-text-primary mb-6">{section.title}</h2>
                
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.type !== 'toggle') {
                          handleSettingClick(section.title, item.id);
                        }
                      }}
                      className={`${
                        item.type === 'toggle' ? '' : 'cursor-pointer hover:bg-surface-light rounded-lg p-4 transition-colors'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-text-primary mb-1">{item.title}</h3>
                          <p className="text-sm text-text-secondary">{item.description}</p>
                        </div>
                        
                        {item.type === 'select' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-text-secondary">{item.description}</span>
                            <ArrowLeft size={16} className="text-text-secondary rotate-180" />
                          </div>
                        )}
                        
                        {item.type === 'action' && (
                          <ArrowLeft size={16} className="text-text-secondary rotate-180" />
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
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <h3 className="text-base font-semibold text-text-primary mb-2">RevLink</h3>
            <p className="text-sm text-text-secondary">Version 1.0.0</p>
            <p className="text-sm text-text-secondary mt-1">車・バイク愛好家のためのSNS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
