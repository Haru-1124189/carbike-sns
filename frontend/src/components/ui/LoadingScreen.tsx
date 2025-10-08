import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: '#000000' }}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* メインのローディングコンテンツ */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {/* 新しい車とバイクのスプラッシュ画像 - 全画面表示 */}
          <div className="relative w-full h-full animate-fadeInUp">
            <img
              src="/carbike_loding.jpg"
              alt="CarBike Splash"
              className="w-full h-full object-contain"
              style={{
                filter: 'contrast(2) brightness(1.5) saturate(1.5)',
                mixBlendMode: 'difference',
                backgroundColor: 'transparent',
                isolation: 'isolate'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
