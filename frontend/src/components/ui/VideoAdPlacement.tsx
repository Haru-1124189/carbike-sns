import { Play, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface AdPlacement {
  id: string;
  timestamp: number; // 秒単位
  type: 'midroll' | 'preroll' | 'postroll';
  duration?: number; // 広告の長さ（秒）
}

interface VideoAdPlacementProps {
  videoDuration: number; // 動画の総時間（秒）
  adPlacements: AdPlacement[];
  onAdPlacementsChange: (placements: AdPlacement[]) => void;
  onPreview?: (timestamp: number) => void;
  disabled?: boolean;
}

export const VideoAdPlacement: React.FC<VideoAdPlacementProps> = ({
  videoDuration,
  adPlacements,
  onAdPlacementsChange,
  onPreview,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // タイムスタンプをピクセル位置に変換
  const timestampToPixel = useCallback((timestamp: number) => {
    if (!timelineRef.current) return 0;
    const timelineWidth = timelineRef.current.offsetWidth;
    return (timestamp / videoDuration) * timelineWidth;
  }, [videoDuration]);

  // ピクセル位置をタイムスタンプに変換
  const pixelToTimestamp = useCallback((pixel: number) => {
    if (!timelineRef.current) return 0;
    const timelineWidth = timelineRef.current.offsetWidth;
    return Math.max(0, Math.min(videoDuration, (pixel / timelineWidth) * videoDuration));
  }, [videoDuration]);

  // 時間をフォーマット（MM:SS）
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 広告を追加
  const addAdPlacement = useCallback((type: AdPlacement['type']) => {
    const newPlacement: AdPlacement = {
      id: `ad-${Date.now()}`,
      timestamp: type === 'preroll' ? 0 : 
                 type === 'postroll' ? videoDuration : 
                 videoDuration / 2, // ミッドロールは中央に配置
      type,
      duration: type === 'midroll' ? 30 : undefined // ミッドロールは30秒
    };
    
    onAdPlacementsChange([...adPlacements, newPlacement]);
  }, [adPlacements, onAdPlacementsChange, videoDuration]);

  // 広告を削除
  const removeAdPlacement = useCallback((id: string) => {
    onAdPlacementsChange(adPlacements.filter(ad => ad.id !== id));
  }, [adPlacements, onAdPlacementsChange]);

  // 広告の位置を更新
  const updateAdPlacement = useCallback((id: string, timestamp: number) => {
    const updated = adPlacements.map(ad => 
      ad.id === id ? { ...ad, timestamp: Math.max(0, Math.min(videoDuration, timestamp)) } : ad
    );
    onAdPlacementsChange(updated);
  }, [adPlacements, onAdPlacementsChange, videoDuration]);

  // ドラッグ開始
  const handleMouseDown = useCallback((e: React.MouseEvent, adId: string) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    
    const ad = adPlacements.find(a => a.id === adId);
    if (ad) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const newTimestamp = pixelToTimestamp(e.clientX - rect.left);
        updateAdPlacement(adId, newTimestamp);
      }
    }
  }, [disabled, adPlacements, pixelToTimestamp, updateAdPlacement]);

  // ドラッグ中
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const newTimestamp = pixelToTimestamp(e.clientX - rect.left);
    
    // 最も近い広告を更新（簡易実装）
    const closestAd = adPlacements.reduce((closest, ad) => {
      const adPixel = timestampToPixel(ad.timestamp);
      const currentPixel = timestampToPixel(newTimestamp);
      const closestPixel = timestampToPixel(closest.timestamp);
      
      return Math.abs(adPixel - currentPixel) < Math.abs(closestPixel - currentPixel) ? ad : closest;
    });
    
    updateAdPlacement(closestAd.id, newTimestamp);
  }, [isDragging, adPlacements, pixelToTimestamp, timestampToPixel, updateAdPlacement]);

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // マウスイベントの設定
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="bg-surface border border-surface-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">広告挿入位置の設定</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => addAdPlacement('preroll')}
            disabled={disabled || adPlacements.some(ad => ad.type === 'preroll')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            プレロール
          </button>
          <button
            onClick={() => addAdPlacement('midroll')}
            disabled={disabled}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ミッドロール
          </button>
          <button
            onClick={() => addAdPlacement('postroll')}
            disabled={disabled || adPlacements.some(ad => ad.type === 'postroll')}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ポストロール
          </button>
        </div>
      </div>

      {/* タイムライン */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>0:00</span>
          <span>{formatTime(videoDuration)}</span>
        </div>
        
        <div
          ref={timelineRef}
          className="relative h-8 bg-surface-light rounded cursor-pointer"
          style={{ minHeight: '32px' }}
        >
          {/* 動画の進行バー（例示） */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded" />
          
          {/* 広告マーカー */}
          {adPlacements.map((ad) => {
            const pixelPosition = timestampToPixel(ad.timestamp);
            const isPreroll = ad.type === 'preroll';
            const isPostroll = ad.type === 'postroll';
            
            return (
              <div
                key={ad.id}
                className={`absolute top-0 w-3 h-full cursor-move select-none ${
                  isPreroll ? 'bg-blue-500' : 
                  isPostroll ? 'bg-purple-500' : 
                  'bg-green-500'
                } rounded-sm hover:scale-110 transition-transform`}
                style={{ left: `${pixelPosition}px`, transform: 'translateX(-50%)' }}
                onMouseDown={(e) => handleMouseDown(e, ad.id)}
                title={`${ad.type} - ${formatTime(ad.timestamp)}`}
              >
                {/* 広告マーカーのアイコン */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-text-primary bg-surface border border-surface-light rounded px-1 py-0.5 whitespace-nowrap">
                  {formatTime(ad.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 広告一覧 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-text-primary">設定済み広告</h4>
        {adPlacements.length === 0 ? (
          <p className="text-sm text-text-secondary">広告が設定されていません</p>
        ) : (
          <div className="space-y-2">
            {adPlacements.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center justify-between p-2 bg-surface-light rounded"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded ${
                    ad.type === 'preroll' ? 'bg-blue-500' : 
                    ad.type === 'postroll' ? 'bg-purple-500' : 
                    'bg-green-500'
                  }`} />
                  <span className="text-sm text-text-primary">
                    {ad.type === 'preroll' ? 'プレロール' : 
                     ad.type === 'postroll' ? 'ポストロール' : 
                     'ミッドロール'} - {formatTime(ad.timestamp)}
                  </span>
                  {ad.duration && (
                    <span className="text-xs text-text-secondary">
                      ({ad.duration}秒)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPreview?.(ad.timestamp)}
                    className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                    title="プレビュー"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={() => removeAdPlacement(ad.id)}
                    disabled={disabled}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    title="削除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ヒント */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-300">
        <p className="font-medium mb-1">💡 ヒント</p>
        <ul className="space-y-1 text-xs">
          <li>• プレロール: 動画開始前の広告（1つのみ）</li>
          <li>• ミッドロール: 動画途中の広告（複数可能）</li>
          <li>• ポストロール: 動画終了後の広告（1つのみ）</li>
          <li>• 広告マーカーをドラッグして位置を調整できます</li>
        </ul>
      </div>
    </div>
  );
};
