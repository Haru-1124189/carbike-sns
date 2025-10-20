import { ArrowLeft, FileText } from 'lucide-react';
import React from 'react';

interface TermsOfServicePageProps {
  onBackClick?: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBackClick }) => {
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
          <h1 className="text-2xl font-bold text-text-primary">利用規約</h1>
        </div>

        {/* 利用規約内容 */}
        <div className="space-y-6">
          {/* 概要 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-white">サービス利用規約</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              RevLink（以下「当サービス」）をご利用いただく前に、本利用規約を必ずお読みください。
              当サービスをご利用いただくことで、本規約に同意したものとみなします。
            </p>
          </div>

          {/* 第1条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第1条（サービスの概要）</h3>
            <div className="space-y-3 text-text-secondary">
              <p>当サービスは、車・バイク愛好家のためのソーシャルネットワーキングサービスです。</p>
              <ul className="ml-4 space-y-1">
                <li>• 投稿・コミュニティ機能</li>
                <li>• 車種データベース・年式レンジ機能</li>
                <li>• Revフリマ機能（フリーマーケット・Shop）</li>
                <li>• ツーリング募集・参加機能</li>
                <li>• 動画配信・視聴機能</li>
                <li>• 申請・審査機能（Shop・クリエイター）</li>
                <li>• PWA（プログレッシブウェブアプリ）機能</li>
                <li>• その他関連サービス</li>
              </ul>
            </div>
          </div>

          {/* 第2条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第2条（利用資格）</h3>
            <div className="space-y-3 text-text-secondary">
              <ul className="space-y-2">
                <li>• 13歳以上の方（13歳以上18歳未満の方は保護者の同意が必要）</li>
                <li>• 日本国内在住の方</li>
                <li>• 本規約に同意いただける方</li>
                <li>• 虚偽の情報でアカウントを作成していない方</li>
              </ul>
            </div>
          </div>

          {/* 第3条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第3条（アカウント管理）</h3>
            <div className="space-y-3 text-text-secondary">
              <p>ユーザーは以下の責任を負います：</p>
              <ul className="ml-4 space-y-1">
                <li>• アカウント情報の正確性を保つこと</li>
                <li>• パスワードの適切な管理</li>
                <li>• アカウントの不正使用の防止</li>
                <li>• アカウントに関する全ての活動への責任</li>
              </ul>
            </div>
          </div>

          {/* 第4条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第4条（禁止事項）</h3>
            <div className="space-y-4 text-text-secondary">
              <div>
                <h4 className="font-medium text-white mb-2">一般的な禁止事項</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 法令違反または公序良俗に反する行為</li>
                  <li>• 他のユーザーへの迷惑行為・嫌がらせ</li>
                  <li>• 虚偽情報の投稿・拡散</li>
                  <li>• 著作権侵害・知的財産権侵害</li>
                  <li>• スパム・宣伝目的の投稿</li>
                  <li>• アカウントの売買・譲渡</li>
                  <li>• システムの不正利用・改ざん</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">セキュリティ関連の禁止事項</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 他のユーザーのアカウントへの不正アクセス</li>
                  <li>• パスワードの推測・解析行為</li>
                  <li>• システムの脆弱性を悪用する行為</li>
                  <li>• マルウェア・ウイルスの配布</li>
                  <li>• 個人情報の不正取得・悪用</li>
                  <li>• フィッシング・詐欺行為</li>
                </ul>
              </div>

              <div>
                <p>• その他当サービスが不適切と判断する行為</p>
              </div>
            </div>
          </div>

          {/* 第5条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第5条（コンテンツの取り扱い）</h3>
            <div className="space-y-3 text-text-secondary">
              <div>
                <h4 className="font-medium text-white">投稿内容について</h4>
                <ul className="ml-4 space-y-1">
                  <li>• ユーザーは投稿内容の著作権を保持します</li>
                  <li>• 当サービスでの表示・配信に必要な権利を許諾します</li>
                  <li>• 投稿内容は自己責任で公開してください</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white">コンテンツの削除</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 規約違反と判断されたコンテンツは削除される場合があります</li>
                  <li>• 削除されたコンテンツの復旧はできません</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 第5条の2 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第5条の2（個人情報・データ保護）</h3>
            <div className="space-y-4 text-text-secondary">
              <div>
                <h4 className="font-medium text-white mb-2">個人情報の取り扱い</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 個人情報の取り扱いについては別途プライバシーポリシーに従います</li>
                  <li>• ユーザーは正確な情報を提供する責任があります</li>
                  <li>• 個人情報の変更・削除は設定画面から行えます</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">情報セキュリティ</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 当サービスは適切なセキュリティ対策を実施します</li>
                  <li>• ただし、100%のセキュリティは保証できません</li>
                  <li>• ユーザーはパスワードの適切な管理に責任を負います</li>
                  <li>• 第三者による不正アクセスの可能性について免責します</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">情報漏洩時の対応</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 情報漏洩が発生した場合は速やかにユーザーに通知します</li>
                  <li>• 必要に応じて関係機関への報告を行います</li>
                  <li>• 漏洩による損害については免責事項の対象となります</li>
                  <li>• ユーザーは速やかにパスワード変更等の対策を取ってください</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 第6条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第6条（Revフリマ）</h3>
            <div className="space-y-4 text-text-secondary">
              <div>
                <h4 className="font-medium text-white mb-2">取引の性質</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 商品の出品・購入は利用者間で直接行います</li>
                  <li>• 当サービスは取引の仲介プラットフォームとして機能します</li>
                  <li>• 当サービスは売買契約の当事者ではありません</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">決済について</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 決済はStripe決済システムを通じて行われます</li>
                  <li>• 決済処理はStripeが責任を持って行います</li>
                  <li>• 当サービスは決済情報を保存・管理しません</li>
                  <li>• 商品取引には7.2%の手数料がかかります</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">責任の範囲</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 商品の品質・状態・配送に関する責任は当事者にあります</li>
                  <li>• 取引に関するトラブルは当事者間で解決してください</li>
                  <li>• 当サービスはトラブル解決の仲介は行いますが、最終的な責任は負いません</li>
                  <li>• 詐欺・不正取引等の報告があった場合は調査・対応を行います</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">禁止事項</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 違法商品・危険物・偽造品の出品</li>
                  <li>• 虚偽の商品情報・画像の掲載</li>
                  <li>• 価格操作・市場攪乱行為</li>
                  <li>• 複数アカウントでの不正な取引</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Shop機能について</h4>
                <ul className="ml-4 space-y-1">
                  <li>• Shop申請には事業者としての適切な書類が必要です</li>
                  <li>• Shop出品者は消費者保護法に準拠する必要があります</li>
                  <li>• 事業者としての法的責任はShop申請者にあります</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 第7条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第7条（免責事項）</h3>
            <div className="space-y-4 text-text-secondary">
              <div>
                <h4 className="font-medium text-white mb-2">一般的な免責</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 当サービスは「現状のまま」提供されます</li>
                  <li>• サービスの中断・終了による損害について責任を負いません</li>
                  <li>• ユーザー間のトラブルについて責任を負いません</li>
                  <li>• 投稿内容の正確性について保証しません</li>
                  <li>• システム障害・データ損失について責任を負いません</li>
                  <li>• 情報漏洩・不正アクセスによる損害について責任を負いません</li>
                  <li>• 第三者によるサービスの不正利用による損害について責任を負いません</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Revフリマ関連の免責</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 商品の品質・状態・配送に関する損害について責任を負いません</li>
                  <li>• 取引の履行・不履行について責任を負いません</li>
                  <li>• 決済システム（Stripe）の障害による損害について責任を負いません</li>
                  <li>• 詐欺・不正取引による損害について責任を負いません</li>
                  <li>• Shop申請者の事業者としての法的責任について保証しません</li>
                  <li>• 商品の安全性・合法性について保証しません</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">当サービスの役割</h4>
                <ul className="ml-4 space-y-1">
                  <li>• 当サービスは取引の仲介プラットフォームとして機能します</li>
                  <li>• トラブル解決のサポートは行いますが、最終的な責任は負いません</li>
                  <li>• 不正行為の調査・対応は行いますが、損害の補償は行いません</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 第8条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第8条（サービスの変更・終了）</h3>
            <div className="space-y-3 text-text-secondary">
              <ul className="space-y-2">
                <li>• 当サービスは事前通知なく変更・終了する場合があります</li>
                <li>• 重要な変更がある場合は事前に通知します</li>
                <li>• サービス終了時はデータの保存期間を設けます</li>
                <li>• ユーザーはアカウント削除によりいつでも利用を停止できます</li>
              </ul>
            </div>
          </div>

          {/* 第9条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第9条（規約の変更）</h3>
            <div className="space-y-3 text-text-secondary">
              <ul className="space-y-2">
                <li>• 本規約は必要に応じて変更される場合があります</li>
                <li>• 重要な変更がある場合はサービス内で通知します</li>
                <li>• 変更後の規約はサービス内に掲載された時点で効力を生じます</li>
                <li>• 変更に同意できない場合はアカウントを削除してください</li>
              </ul>
            </div>
          </div>

          {/* 第10条 */}
          <div className="bg-surface rounded-xl border border-surface-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">第10条（準拠法・管轄）</h3>
            <div className="space-y-3 text-text-secondary">
              <ul className="space-y-2">
                <li>• 本規約は日本法に準拠します</li>
                <li>• サービスに関する紛争は東京地方裁判所を専属的合意管轄とします</li>
                <li>• 国際的な利用に関する制限が適用される場合があります</li>
              </ul>
            </div>
          </div>

          {/* お問い合わせ */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <FileText size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-blue-400 mb-2">お問い合わせ</h3>
                <div className="text-sm text-text-secondary space-y-1">
                  <p>利用規約に関するご質問やご不明な点がございましたら、お気軽にお問い合わせください。</p>
                  <p>お問い合わせ: <a href="mailto:legal@carbike-sns.com" className="text-primary underline">legal@carbike-sns.com</a></p>
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
