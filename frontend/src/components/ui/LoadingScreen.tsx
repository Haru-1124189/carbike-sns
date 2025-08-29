import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 背景のグラデーション効果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-surface opacity-50"></div>
        
        {/* メインのローディングコンテンツ */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* 新しい車とバイクのスプラッシュ画像 */}
          <div className="relative w-80 h-40 animate-fadeInUp">
            <img
              src="/carbike_loding.jpg"
              alt="CarBike Splash"
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* ローディングテキスト */}
          <div className="text-center space-y-2 animate-fadeInUp">
            <h1 className="text-2xl font-bold text-text-primary">
              CarBike SNS
            </h1>
            <p className="text-text-secondary text-sm">
              車とバイクのコミュニティ
            </p>
          </div>
          
          {/* ローディングスピナー */}
          <div className="flex items-center space-x-2 animate-fadeInUp">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
