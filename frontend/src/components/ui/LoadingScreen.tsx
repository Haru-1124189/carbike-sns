import React, { useMemo, useState } from 'react';

export const LoadingScreen: React.FC = () => {
  // 起動ごとに一度だけ決める（1/30の確率でスペシャル画像）
  const initialSrc = useMemo(() => {
    const special = Math.random() < 1 / 30; // 約3.33%
    // special 用の画像は public 配下に `opening-special.jpg` を配置してください
    return special ? '/opening-special.jpg' : '/carbike_loding.jpg';
  }, []);
  const [imgSrc, setImgSrc] = useState(initialSrc);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: '#000000' }}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* メインのローディングコンテンツ */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {/* 新しい車とバイクのスプラッシュ画像 - 全画面表示 */}
          <div className="relative w-full h-full animate-fadeInUp">
            <img
              src={imgSrc}
              alt="CarBike Splash"
              className="w-full h-full object-contain"
              style={{
                filter: 'contrast(2) brightness(1.5) saturate(1.5)',
                mixBlendMode: 'difference',
                backgroundColor: 'transparent',
                isolation: 'isolate'
              }}
              onError={() => {
                // スペシャル画像が無い場合は通常画像にフォールバック
                if (imgSrc !== '/carbike_loding.jpg') setImgSrc('/carbike_loding.jpg');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
