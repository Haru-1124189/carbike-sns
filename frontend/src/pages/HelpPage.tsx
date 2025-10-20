import { ArrowLeft, Bell, Building2, Car, HelpCircle, MapPin, MessageSquare, Search, Settings, ShoppingBag, Smartphone, Users, Video } from 'lucide-react';
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
          a: 'Linkタブから「投稿」または「質問」を選択して作成できます。テキスト、画像、動画、車種タグを追加可能です。' 
        },
        { 
          q: 'アカウントはどうやって作成しますか？', 
          a: 'ログイン画面の「新規登録」から、メールアドレスとパスワードでアカウントを作成できます。' 
        },
        { 
          q: 'プロフィールはどこで編集できますか？', 
          a: '下部タブのProfileから「プロフィール編集」を選択して、名前、自己紹介、プロフィール画像を変更できます。' 
        },
        { 
          q: '愛車はどうやって登録しますか？', 
          a: 'Profileタブの「愛車登録」から車種を選択し、年式レンジを設定して登録できます。複数の車両を登録可能です。' 
        },
        { 
          q: 'お気に入り車種はどうやって登録しますか？', 
          a: 'Profileタブの「お気に入り車種」から興味のある車種を検索して登録できます。投稿の年式レンジフィルタリングに使用されます。' 
        },
      ]
    },

    // 投稿・コンテンツ
    { 
      category: '投稿・コンテンツ', 
      icon: MessageSquare,
      items: [
        { 
          q: 'Linkとは何ですか？', 
          a: 'Linkは特定のトピックについて議論するための投稿です。質問や相談、情報共有に使用できます。' 
        },
        { 
          q: '車種タグとは何ですか？', 
          a: '投稿時に車名を入力すると、自動で車種データベースから検索され、年式レンジを選択できます。これにより投稿が年式レンジフィルタリングの対象になります。' 
        },
        { 
          q: '年式レンジフィルタリングとは何ですか？', 
          a: 'LinkやMaintenanceの「愛車」「お気に入り」タブで、登録した車両の年式レンジと一致する投稿のみが表示される機能です。' 
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

    // Revフリマ
    { 
      category: 'Revフリマ', 
      icon: ShoppingBag,
      items: [
        { 
          q: 'Revフリマとは何ですか？', 
          a: '車やバイク関連の商品を出品・購入できる機能です。フリーマーケットとShopの2つのタイプがあります。' 
        },
        { 
          q: 'フリーマーケットとShopの違いは何ですか？', 
          a: 'フリーマーケットは個人の売買、Shopは事業者による新品販売です。Shopとして出品するには申請が必要です。' 
        },
        { 
          q: '商品を出品するには？', 
          a: 'Marketタブから「出品」ボタンを押し、商品名、価格、説明、画像を入力して出品できます。' 
        },
        { 
          q: 'フリーマーケットの手数料はいくらですか？', 
          a: 'フリーマーケットの手数料は7.2%です。Shopと同じ料金体系です。' 
        },
        { 
          q: 'Shop申請はどこからできますか？', 
          a: '設定ページの「申請」セクションから「Shop申請」を選択し、事業者情報を入力して申請できます。' 
        },
        { 
          q: '商品を購入するには？', 
          a: '商品詳細ページで「購入」ボタンを押し、支払い情報を入力して購入できます。' 
        },
        { 
          q: '決済は安全ですか？', 
          a: 'Stripeという世界的に信頼されている決済システムを使用しています。クレジットカード情報は暗号化され、安全に処理されます。' 
        },
        { 
          q: 'Stripeとは何ですか？', 
          a: 'Stripeは世界190以上の国・地域で利用されている決済プラットフォームです。大手企業も採用しており、PCI DSS準拠の高いセキュリティレベルを提供しています。' 
        },
        { 
          q: '出品した商品を編集・削除できますか？', 
          a: '自分の出品商品一覧から編集・削除が可能です。購入済みの商品は編集できません。' 
        },
        { 
          q: 'レビューは書けますか？', 
          a: '購入完了後に商品レビューを投稿できます。他のユーザーの参考になります。' 
        },
      ]
    },

    // Shop機能
    { 
      category: 'Shop機能', 
      icon: Building2,
      items: [
        { 
          q: 'Shop申請に必要な情報は何ですか？', 
          a: '店舗名、事業許可証、税務署への届出番号、連絡先、住所、事業内容などを入力する必要があります。' 
        },
        { 
          q: 'Shop申請の審査期間はどのくらいですか？', 
          a: '申請から審査完了まで通常3-7営業日程度かかります。審査結果は通知でお知らせします。' 
        },
        { 
          q: 'Shop申請が却下された場合は？', 
          a: '却下理由を確認し、不足している情報を補完して再申請できます。' 
        },
        { 
          q: 'Shopとして出品できる商品は？', 
          a: '車・バイク関連の新品商品が対象です。中古品はフリーマーケットで出品してください。' 
        },
        { 
          q: 'Shopの手数料はいくらですか？', 
          a: 'Shop出品の手数料は7.2%です。フリーマーケットと同じ料金体系です。' 
        },
        { 
          q: 'Shopでの決済はどうなりますか？', 
          a: 'Stripe決済システムを使用し、購入者の支払いは安全に処理されます。売上金はStripeを通じてShopアカウントに振り込まれます。' 
        },
        { 
          q: 'Shop申請の状況はどこで確認できますか？', 
          a: '設定ページの「申請」セクションで現在の申請状況を確認できます。' 
        },
      ]
    },

    // 車種申請・データベース
    { 
      category: '車種申請・データベース', 
      icon: Car,
      items: [
        { 
          q: '車種申請とは何ですか？', 
          a: 'データベースにない車種を申請して追加できる機能です。メーカー名、モデル名、年式レンジを入力して申請できます。' 
        },
        { 
          q: '車種申請はどこからできますか？', 
          a: '愛車登録画面の「新規申請」ボタンから申請できます。複数の年式レンジを一度に申請可能です。' 
        },
        {
          q: '年式レンジはどのように設定しますか？', 
          a: '開始年月と終了年月を設定します。例：2001年6月〜2005年8月。月単位での細かい設定が可能です。' 
        },
        { 
          q: '申請はいつ反映されますか？', 
          a: '管理者が審査後、承認されるとデータベースに追加されます。申請状況は通知で確認できます。' 
        },
      ]
    },

    // 動画・クリエイター
    { 
      category: '動画・クリエイター', 
      icon: Video,
      items: [
        { 
          q: 'クリエイター申請はどこからできますか？', 
          a: '設定ページの「申請」セクションから「クリエイター申請」を選択し、申請できます。' 
        },
        { 
          q: 'クリエイター申請に必要な情報は何ですか？', 
          a: 'YouTubeチャンネル情報、制作実績、コンテンツ企画などを入力する必要があります。' 
        },
        { 
          q: '動画配信者になるには？', 
          a: 'クリエイター申請が承認されると、動画アップロードと分析機能が利用できます。' 
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

    // PWA・アプリ機能
    { 
      category: 'PWA・アプリ機能', 
      icon: Smartphone,
      items: [
        { 
          q: 'PWAとは何ですか？', 
          a: 'Progressive Web App（プログレッシブウェブアプリ）の略で、ブラウザからアプリのように使える機能です。' 
        },
        { 
          q: 'ホーム画面に追加するには？', 
          a: 'ブラウザのメニューから「ホーム画面に追加」を選択すると、アプリのように使用できます。' 
        },
        { 
          q: 'オフラインでも使用できますか？', 
          a: '一部の機能はオフラインでも使用できます。投稿や商品閲覧は可能ですが、新しい投稿は接続時に同期されます。' 
        },
        { 
          q: 'プッシュ通知を受け取るには？', 
          a: 'ブラウザの通知許可を有効にし、設定ページで通知設定をONにしてください。' 
        },
        { 
          q: 'アプリの更新はどうなりますか？', 
          a: 'PWAは自動的に更新されます。新しいバージョンが利用可能な場合は、次回アクセス時に自動で適用されます。' 
        },
        { 
          q: 'データはどこに保存されますか？', 
          a: 'アカウント情報はクラウドに保存され、投稿や設定はデバイスとクラウドの両方に保存されます。' 
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
          q: '車種が見つかりません', 
          a: '車種申請機能を使って新しい車種を申請してください。または、車名の表記を変えて検索してみてください。' 
        },
        { 
          q: '年式レンジフィルタリングが効きません', 
          a: '愛車やお気に入り車種の年式レンジが正しく設定されているか確認してください。投稿にも車種タグが正しく設定されている必要があります。' 
        },
        { 
          q: 'Revフリマで商品が購入できません', 
          a: '支払い情報が正しく入力されているか確認してください。商品が売り切れの場合は購入できません。' 
        },
        { 
          q: '決済でエラーが発生します', 
          a: 'Stripeの決済システムでエラーが発生した場合、カード情報や請求先住所を確認してください。問題が続く場合は、カード会社にお問い合わせください。' 
        },
        { 
          q: '売上金の受け取りはどうなりますか？', 
          a: 'Stripeアカウントの設定に従って、売上金は指定した銀行口座に自動で振り込まれます。初回の振込まで数営業日かかる場合があります。' 
        },
        { 
          q: 'Shop申請が送信できません', 
          a: '必要な情報がすべて入力されているか確認してください。事業許可証や税務署への届出番号などが必要です。' 
        },
        { 
          q: 'クリエイター申請が送信できません', 
          a: 'YouTubeチャンネル情報や制作実績など、必要な情報がすべて入力されているか確認してください。' 
        },
        { 
          q: '通知が来ません', 
          a: 'ブラウザの通知許可を確認し、設定ページで通知設定が有効になっているかチェックしてください。' 
        },
        { 
          q: 'ホーム画面に追加できません', 
          a: 'ブラウザがPWAに対応しているか確認してください。Chrome、Safari、Edgeなどの最新版をお使いください。' 
        },
        { 
          q: 'オフラインで使用できません', 
          a: '一度オンラインでアクセスしてからオフラインで使用してください。初回アクセス時にキャッシュが作成されます。' 
        },
        { 
          q: '画像がアップロードできません', 
          a: '画像サイズが5MB以下であることを確認してください。対応形式はJPG、PNG、GIFです。' 
        },
        { 
          q: 'アカウントを削除したい', 
          a: '設定ページの「アカウント削除」から削除できます。一度削除すると復元できませんので注意してください。' 
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <div className="max-w-[420px] mx-auto px-4 py-6 pb-32">
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
                <p>• 車種申請に関するお問い合わせも歓迎です</p>
                <p>• お問い合わせ: <a href="mailto:support@carbike-sns.com" className="text-primary underline">support@carbike-sns.com</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* 機能一覧 */}
        <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Search size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-green-400 mb-2">主要機能一覧</h3>
              <div className="text-sm text-text-secondary space-y-1">
                <p>• <strong>投稿機能:</strong> Link、質問、整備記録の投稿</p>
                <p>• <strong>年式レンジフィルタリング:</strong> 愛車・お気に入り車種に基づく投稿表示</p>
                <p>• <strong>車種申請:</strong> 新しい車種のデータベース追加申請</p>
                <p>• <strong>Revフリマ:</strong> フリーマーケットとShop機能</p>
                <p>• <strong>Shop機能:</strong> 事業者向け商品販売プラットフォーム</p>
                <p>• <strong>クリエイター機能:</strong> 動画配信・コンテンツ制作</p>
                <p>• <strong>ツーリング機能:</strong> ツーリング募集・参加</p>
                <p>• <strong>PWA機能:</strong> アプリのような使用体験</p>
                <p>• <strong>通知機能:</strong> リアルタイム通知・設定</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


