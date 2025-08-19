import React from 'react';

export const BannerAd: React.FC = () => {
  return (
    <div className="w-full">
      <div className="max-w-[420px] mx-auto">
        <div className="rounded-2xl bg-orange-500/20 border border-orange-400/30 text-orange-200 p-4 m-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">おすすめ車種</div>
              <div className="text-xs opacity-80">あなたにおすすめの車種をご紹介</div>
            </div>
            <div className="text-xs opacity-60">AD</div>
          </div>
        </div>
      </div>
    </div>
  );
};
