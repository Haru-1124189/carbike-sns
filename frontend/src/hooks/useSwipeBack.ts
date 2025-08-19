import { useEffect, useRef } from 'react';

interface SwipeConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  preventDefault?: boolean;
  onSwipeBack?: () => void;
}

export const useSwipeBack = (config: SwipeConfig = {}) => {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null);
  
  const {
    minSwipeDistance = 50,
    maxSwipeTime = 500,
    preventDefault = false,
    onSwipeBack
  } = config;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
        time: Date.now()
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      touchEnd.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };

      const swipeDistance = touchEnd.current.x - touchStart.current.x;
      const swipeTime = touchEnd.current.time - touchStart.current.time;
      const verticalDistance = Math.abs(touchStart.current.y - touchEnd.current.y);

      // 右スワイプの条件をチェック（左から右へのスワイプ）
      if (
        swipeDistance > minSwipeDistance && // 最小スワイプ距離
        swipeTime < maxSwipeTime && // 最大スワイプ時間
        verticalDistance < 100 && // 垂直方向の移動が少ない（水平スワイプ）
        touchStart.current.x < 100 // 画面の左端近くから始まっている
      ) {
        // 戻る動作を実行
        if (onSwipeBack) {
          onSwipeBack();
        } else {
          // デフォルトの戻る動作（何もしない）
          console.log('Swipe back detected, but no callback provided');
        }
      }

      // リセット
      touchStart.current = null;
      touchEnd.current = null;
    };

    // イベントリスナーを追加
    document.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    document.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // クリーンアップ
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [minSwipeDistance, maxSwipeTime, preventDefault, onSwipeBack]);
};
