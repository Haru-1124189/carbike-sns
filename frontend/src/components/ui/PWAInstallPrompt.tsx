import { Download, Smartphone, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PWAInstallPromptProps {
  onClose: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOSかどうかを判定
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // スタンドアロンモードかどうかを判定
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  // 既にインストール済みの場合は表示しない
  if (isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-sm w-full mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Smartphone size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">アプリをインストール</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Download size={24} className="text-primary" />
            </div>
            <h4 className="text-base font-medium text-text-primary mb-2">
              RevLinkをホーム画面に追加
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              より快適にご利用いただけるよう、ホーム画面に追加することをお勧めします。
            </p>
          </div>

          {/* インストール手順 */}
          <div className="space-y-3 mb-4">
            {isIOS ? (
              // iOS用の手順
              <>
                <div className="flex items-start space-x-3 p-3 bg-surface-light rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">共有ボタンをタップ</p>
                    <p className="text-xs text-text-secondary">Safariの下部にある共有ボタン（□↑）をタップ</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-surface-light rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">「ホーム画面に追加」を選択</p>
                    <p className="text-xs text-text-secondary">メニューから「ホーム画面に追加」をタップ</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-surface-light rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">「追加」をタップ</p>
                    <p className="text-xs text-text-secondary">確認画面で「追加」をタップして完了</p>
                  </div>
                </div>
              </>
            ) : (
              // Android用の手順
              <>
                <div className="flex items-start space-x-3 p-3 bg-surface-light rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">メニューボタンをタップ</p>
                    <p className="text-xs text-text-secondary">ブラウザの右上の「⋮」メニューをタップ</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-surface-light rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">「アプリをインストール」を選択</p>
                    <p className="text-xs text-text-secondary">メニューから「アプリをインストール」をタップ</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-surface-light rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">「インストール」をタップ</p>
                    <p className="text-xs text-text-secondary">確認画面で「インストール」をタップして完了</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* メリット */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
            <h5 className="text-sm font-medium text-primary mb-2">ホーム画面に追加すると...</h5>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• アプリのように素早く起動</li>
              <li>• プッシュ通知を受け取れる</li>
              <li>• オフラインでも一部機能が利用可能</li>
              <li>• より快適なユーザー体験</li>
            </ul>
          </div>
        </div>

        {/* フッター */}
        <div className="flex space-x-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-surface-light text-text-primary rounded-lg hover:bg-surface transition-colors text-sm font-medium"
          >
            後で
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            手順を確認
          </button>
        </div>
      </div>
    </div>
  );
};
