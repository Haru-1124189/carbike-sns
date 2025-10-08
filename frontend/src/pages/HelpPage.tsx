import { ArrowLeft, HelpCircle, MessageSquare, Users, MapPin, Video, Settings, Shield, Bell } from 'lucide-react';
import React, { useState } from 'react';

interface HelpPageProps {
  onBackClick?: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onBackClick }) => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    // 基本的な使い方
    { 
      category: '基本的な使い方', 
      icon: HelpCircle,
      items: [
        { 
          q: '投稿はどうやって作成しますか？', 
          a: 'ホームのクイックアクション、または下部のPostタブから作成できます。テキスト、画像、動画を投稿可能です。' 
        },
        { 
          q: 'アカウントはどうやって作成しますか？', 
          a: 'ログイン画面の「新規登録」から、メールアドレスとパスワードでアカウントを作成できます。' 
        },
        { 
          q: 'プロフィールはどこで編集できますか？', 
          a: '下部タブのProfileから「プロフィール編集」を選択して、名前、自己紹介、プロフィール画像を変更できます。' 
        },
      ]
    },

    // 投稿・コンテンツ
    { 
      category: '投稿・コンテンツ', 
      icon: MessageSquare,
      items: [
        { 
          q: 'スレッドとは何ですか？', 
          a: 'スレッドは特定のトピックについて議論するための投稿です。質問や相談、情報共有に使用できます。' 
        },
        { 
          q: '動画はどこでアップロードできますか？', 
          a: 'Videosタブから動画をアップロードできます。サムネイルの自動生成、カテゴリ分類、タグ付けが可能です。' 
        },
        { 
          q: '整備記録はどこにありますか？', 
          a: '下部タブのMaintから一覧、詳細、投稿が可能です。車両のメンテナンス履歴を記録・管理できます。' 
        },
        { 
          q: 'いいねや返信はどうやってしますか？', 
          a: '投稿の下部にあるハートアイコンでいいね、返信ボタンでコメントができます。' 
        },
      ]
    },

    // ツーリング機能
    { 
      category: 'ツーリング機能', 
      icon: MapPin,
      items: [
        { 
          q: 'ツーリングチャットとは何ですか？', 
          a: 'ツーリングの募集や参加のための機能です。募集中は参加表明ができ、締切後は自動でグループチャットが作成されます。' 
        },
        { 
          q: 'ツーリング募集はどうやって投稿しますか？', 
          a: 'ホームのツーリングチャットボタンから「新規募集」を選択し、場所、日時、詳細を入力して投稿します。' 
        },
        { 
          q: '近くのツーリング通知は何ですか？', 
          a: '住所を登録すると、近くでツーリング募集があった際に通知が届きます。プライバシー設定でON/OFFできます。' 
        },
        { 
          q: 'ツーリングチャットルームはいつ作成されますか？', 
          a: '募集締切後、または投稿者が早期締切した際に、参加者（いいね・返信した人）で自動的にチャットルームが作成されます。' 
        },
      ]
    },

    // 通知・設定
    { 
      category: '通知・設定', 
      icon: Bell,
      items: [
        { 
          q: '通知設定はどこですか？', 
          a: '設定ページの「プライバシー設定」から、いいね通知、返信通知、フォロー通知、ツーリング通知を個別に切り替えできます。' 
        },
        { 
          q: 'ミュートワードとは何ですか？', 
          a: '特定のキーワードを含む投稿を非表示にする機能です。設定ページからキーワードを追加・削除できます。' 
        },
        { 
          q: 'プライバシー設定はどこにありますか？', 
          a: '設定ページの「プライバシー設定」から、プロフィール公開、住所情報表示、通知設定を管理できます。' 
        },
        { 
          q: 'テーマは変更できますか？', 
          a: '設定ページの「テーマ設定」から、紺色、ダーク、ライトテーマを選択できます。' 
        },
      ]
    },

    // フォロー・コミュニティ
    { 
      category: 'フォロー・コミュニティ', 
      icon: Users,
      items: [
        { 
          q: '他のユーザーをフォローするには？', 
          a: 'ユーザープロフィールページの「フォロー」ボタンをタップすると、そのユーザーの投稿がフィードに表示されます。' 
        },
        { 
          q: 'フォロワーはどこで確認できますか？', 
          a: '自分のプロフィールページから「フォロワー」「フォロー中」の数をタップすると、一覧を確認できます。' 
        },
        { 
          q: 'ユーザーをブロックするには？', 
          a: 'ユーザープロフィールページから「ブロック」を選択すると、そのユーザーの投稿が非表示になります。' 
        },
        { 
          q: '投稿を通報するには？', 
          a: '投稿のメニューから「通報」を選択し、理由を選択して通報できます。管理者が内容を確認します。' 
        },
      ]
    },

    // 動画・クリエイター
    { 
      category: '動画・クリエイター', 
      icon: Video,
      items: [
        { 
          q: '動画配信者になるには？', 
          a: '設定ページの「動画配信申請」から申請できます。審査通過後、動画アップロードと分析機能が利用できます。' 
        },
        { 
          q: '動画の分析データはどこで見られますか？', 
          a: '自分の動画一覧で「分析」ボタンをタップすると、視聴回数、視聴時間、収益などの詳細データを確認できます。' 
        },
        { 
          q: '動画のサムネイルは変更できますか？', 
          a: '動画アップロード時に、自動生成されたサムネイルから選択するか、手動でアップロードできます。' 
        },
        { 
          q: '動画のカテゴリは何がありますか？', 
          a: '車、バイク、整備、レビュー、その他から選択できます。適切なカテゴリを選択すると、より多くの人に見てもらえます。' 
        },
      ]
    },

    // トラブルシューティング
    { 
      category: 'トラブルシューティング', 
      icon: Settings,
      items: [
        { 
          q: 'ログインできません', 
          a: 'メールアドレスとパスワードを確認してください。パスワードを忘れた場合は「パスワードを忘れた場合」から再設定できます。' 
        },
        { 
          q: '投稿が表示されません', 
          a: 'インターネット接続を確認してください。それでも解決しない場合は、アプリを再起動してみてください。' 
        },
        { 
          q: '通知が来ません', 
          a: 'ブラウザの通知許可を確認し、設定ページで通知設定が有効になっているかチェックしてください。' 
        },
        { 
          q: 'アカウントを削除したい', 
          a: '設定ページの「アカウント削除」から削除できます。一度削除すると復元できませんので注意してください。' 
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={onBackClick} className="p-2 hover:bg-surface-light rounded-full transition-colors">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">ヘルプ / FAQ</h1>
        </div>

        {/* ヘルプ紹介 */}
        <div className="mb-8">
          <div className="text-sm text-text-secondary">よくある質問をカテゴリ別にまとめています</div>
        </div>

        {/* カテゴリ別FAQ */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {/* カテゴリヘッダー */}
              <button
                onClick={() => toggleExpanded(categoryIndex)}
                className="w-full flex items-center justify-between hover:bg-surface-light rounded-lg p-4 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <category.icon size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold text-text-primary">{category.category}</h2>
                </div>
                <div className={`transform transition-transform ${expandedItems.includes(categoryIndex) ? 'rotate-180' : ''}`}>
                  <ArrowLeft size={16} className="text-text-secondary rotate-90" />
                </div>
              </button>

              {/* FAQアイテム */}
              {expandedItems.includes(categoryIndex) && (
                <div className="mt-4 space-y-4">
                  {category.items.map((faq, itemIndex) => (
                    <div key={itemIndex} className="pl-8">
                      <div className="space-y-2">
                        <h3 className="text-base font-medium text-text-primary">{faq.q}</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* お問い合わせ情報 */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <HelpCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-blue-400 mb-2">まだ解決しませんか？</h3>
              <div className="text-sm text-text-secondary space-y-1">
                <p>• 上記のFAQで解決しない場合は、お気軽にお問い合わせください</p>
                <p>• 不具合報告や機能要望も受け付けています</p>
                <p>• お問い合わせ: <a href="mailto:support@carbike-sns.com" className="text-primary underline">support@carbike-sns.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


