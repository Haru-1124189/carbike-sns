import { ArrowLeft, Shield } from 'lucide-react';
import React from 'react';

interface PrivacyPolicyPageProps {
  onBackClick?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackClick }) => {
  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <div className="max-w-[420px] mx-auto px-4 py-6 pb-32">
        {/* ヘッダー */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-surface-light rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">プライバシーポリシー</h1>
        </div>

        {/* プライバシーポリシー内容 */}
        <div className="space-y-6">
          {/* 概要 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-white">個人情報の取り扱いについて</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              CarBike SNS（以下「当サービス」）は、ユーザーの個人情報を適切に保護し、管理することを重要な責務と考えています。
              本プライバシーポリシーでは、当サービスが収集、使用、保護する個人情報について説明します。
            </p>
          </div>

          {/* 収集する情報 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">1. 収集する情報</h3>
            <div className="space-y-3 text-text-secondary">
              <div>
                <h4 className="font-medium text-white">アカウント情報</h4>
                <ul className="ml-4 space-y-1">
                  <li>• メールアドレス</li>
                  <li>• パスワード（暗号化して保存）</li>
                  <li>• 表示名</li>
                  <li>• プロフィール画像</li>
                  <li>• 自己紹介文</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white">車両情報</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 愛車の車種・年式</li>
                  <li>• お気に入り車種</li>
                  <li>• 整備記録</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white">利用情報</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 投稿内容（テキスト、画像、動画）</li>
                  <li>• いいね、返信、フォロー情報</li>
                  <li>• アクセスログ</li>
                  <li>• デバイス情報</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white">マーケットプレイス情報</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 商品出品・購入履歴</li>
                  <li>• 配送先住所</li>
                  <li>• レビュー・評価</li>
                  <li>• 取引メッセージ</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white">Shop・申請情報</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 事業者情報（店舗名、許可証等）</li>
                  <li>• クリエイター申請情報</li>
                  <li>• 申請審査結果</li>
                  <li>• 連絡先情報</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 利用目的 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">2. 利用目的</h3>
            <div className="space-y-3 text-text-secondary">
              <div>
                <h4 className="font-medium text-white">サービス提供</h4>
                <ul className="ml-4 space-y-1">
                  <li>• アカウント作成・管理</li>
                  <li>• 投稿・コミュニティ機能の提供</li>
                  <li>• 車種検索・年式レンジ機能</li>
                  <li>• マーケットプレイス機能（出品・購入）</li>
                  <li>• Shop・クリエイター申請の審査</li>
                  <li>• ユーザー間のマッチング</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white">サービス改善</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 利用状況の分析</li>
                  <li>• 新機能の開発</li>
                  <li>• バグの修正・改善</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white">コミュニケーション</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 重要な通知の送信</li>
                  <li>• サポート対応</li>
                  <li>• マーケティング情報（同意がある場合）</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 決済情報の取り扱い */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">3. 決済情報の取り扱い</h3>
            <div className="space-y-3 text-text-secondary">
              <div>
                <h4 className="font-medium text-white">Stripe決済システムについて</h4>
                <ul className="ml-4 space-y-1">
                  <li>• クレジットカード情報はStripeが直接処理します</li>
                  <li>• 当サービスは決済情報を保存・管理しません</li>
                  <li>• Stripeのプライバシーポリシーが適用されます</li>
                  <li>• PCI DSS準拠の高いセキュリティレベルを提供</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white">収集される決済関連情報</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 取引履歴（金額、日時、商品情報）</li>
                  <li>• 配送先住所（商品配送のため）</li>
                  <li>• 連絡先情報（取引関連の連絡のため）</li>
                  <li>• クレジットカード情報はStripeが管理</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 情報の共有 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">4. 情報の共有</h3>
            <div className="space-y-3 text-text-secondary">
              <p>当サービスは、以下の場合を除き、個人情報を第三者と共有することはありません：</p>
              <ul className="ml-4 space-y-1">
                <li>• ユーザーの明示的な同意がある場合</li>
                <li>• 法的な要請がある場合</li>
                <li>• サービス提供に必要な限りで、信頼できるパートナーと共有する場合</li>
                <li>• ユーザーが公開設定した情報</li>
                <li>• Stripe等の決済プロバイダー（決済処理のため）</li>
                <li>• 配送業者（商品配送のため）</li>
              </ul>
            </div>
          </div>

          {/* データの保護 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">5. データの保護</h3>
            <div className="space-y-3 text-text-secondary">
              <ul className="space-y-2">
                <li>• SSL/TLS暗号化による通信の保護</li>
                <li>• パスワードのハッシュ化保存</li>
                <li>• 定期的なセキュリティ監査</li>
                <li>• アクセス制限とログ管理</li>
                <li>• データのバックアップと復旧体制</li>
              </ul>
            </div>
          </div>

          {/* ユーザーの権利 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">6. ユーザーの権利</h3>
            <div className="space-y-3 text-text-secondary">
              <p>ユーザーは以下の権利を有します：</p>
              <ul className="ml-4 space-y-1">
                <li>• 個人情報の閲覧・修正・削除</li>
                <li>• アカウントの削除</li>
                <li>• データ処理の停止要請</li>
                <li>• データのポータビリティ（移行）</li>
                <li>• 同意の撤回</li>
              </ul>
            </div>
          </div>

          {/* Cookie */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">7. Cookie の使用</h3>
            <div className="space-y-3 text-text-secondary">
              <p>当サービスは、以下の目的でCookieを使用します：</p>
              <ul className="ml-4 space-y-1">
                <li>• ログイン状態の維持</li>
                <li>• ユーザー設定の保存</li>
                <li>• サービス利用状況の分析</li>
                <li>• 広告の配信（オプトイン）</li>
              </ul>
              <p>ブラウザの設定でCookieを無効にできますが、一部機能が利用できなくなる場合があります。</p>
            </div>
          </div>

          {/* 未成年者の保護 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">8. 未成年者の保護</h3>
            <div className="space-y-3 text-text-secondary">
              <p>当サービスは、13歳未満のユーザーから意図的に個人情報を収集することはありません。</p>
              <p>13歳以上18歳未満のユーザーは、保護者の同意を得てサービスを利用してください。</p>
            </div>
          </div>

          {/* ポリシーの変更 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">9. ポリシーの変更</h3>
            <div className="space-y-3 text-text-secondary">
              <p>本プライバシーポリシーは、必要に応じて更新される場合があります。</p>
              <p>重要な変更がある場合は、サービス内で通知いたします。</p>
              <p>継続してサービスをご利用いただくことで、更新されたポリシーに同意したものとみなします。</p>
            </div>
          </div>

          {/* お問い合わせ */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Shield size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-blue-400 mb-2">お問い合わせ</h3>
                <div className="text-sm text-text-secondary space-y-1">
                  <p>プライバシーポリシーに関するご質問やご不明な点がございましたら、お気軽にお問い合わせください。</p>
                  <p>お問い合わせ: <a href="mailto:privacy@carbike-sns.com" className="text-primary underline">privacy@carbike-sns.com</a></p>
                  <p className="text-xs text-gray-400">最終更新日: 2025年1月15日</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
