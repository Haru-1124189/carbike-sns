import { ArrowLeft, BarChart3, Clock, DollarSign, Eye, Heart, MessageCircle, Share, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { Video, VideoAnalytics } from '../types';

interface VideoAnalyticsPageProps {
  video: Video;
  onBackClick?: () => void;
}

export const VideoAnalyticsPage: React.FC<VideoAnalyticsPageProps> = ({
  video,
  onBackClick
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(video.analytics || null);
  const [loading, setLoading] = useState(false);

  // ダミーデータを生成（実際の実装ではAPIから取得）
  useEffect(() => {
    if (!analytics) {
      setLoading(true);
      // ダミーデータを生成
      const mockAnalytics: VideoAnalytics = {
        totalViews: video.views,
        totalWatchTime: video.views * 180, // 平均3分視聴と仮定
        averageWatchTime: 180,
        revenue: Math.floor(video.views * 0.5), // 1視聴あたり0.5円と仮定
        
        hourlyViews: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          views: Math.floor(Math.random() * 50) + 10,
          watchTime: Math.floor(Math.random() * 5000) + 1000
        })),
        
        dailyViews: Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 100) + 20,
            watchTime: Math.floor(Math.random() * 10000) + 2000,
            revenue: Math.floor(Math.random() * 50) + 10
          };
        }),
        
        likeRate: video.likes / video.views * 100 || 0,
        shareCount: Math.floor(Math.random() * 20) + 5,
        commentCount: Math.floor(Math.random() * 15) + 3,
        
        lastUpdated: new Date()
      };
      
      setTimeout(() => {
        setAnalytics(mockAnalytics);
        setLoading(false);
      }, 1000);
    }
  }, [video, analytics]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}時間${minutes}分${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `¥${amount.toLocaleString()}`;
  };

  const getPeakHour = (): number => {
    if (!analytics) return 0;
    return analytics.hourlyViews.reduce((max, current) => 
      current.views > max.views ? current : max
    ).hour;
  };

  const getTotalRevenue = (): number => {
    if (!analytics) return 0;
    return analytics.dailyViews.reduce((sum, day) => sum + day.revenue, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="p-4 pb-24 pt-0 fade-in max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg text-white">分析データを読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="p-4 pb-24 pt-0 fade-in max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg text-white">分析データがありません</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="p-4 pb-24 pt-0 fade-in max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-4"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">動画分析</h1>
              <p className="text-sm text-gray-400">{video.title}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            最終更新: {analytics.lastUpdated.toLocaleString('ja-JP')}
          </div>
        </div>

        {/* 基本統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総視聴回数</p>
                <p className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <Eye size={24} className="text-primary" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総視聴時間</p>
                <p className="text-2xl font-bold text-white">{formatDuration(analytics.totalWatchTime)}</p>
              </div>
              <Clock size={24} className="text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">平均視聴時間</p>
                <p className="text-2xl font-bold text-white">{formatDuration(analytics.averageWatchTime)}</p>
              </div>
              <TrendingUp size={24} className="text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総収益</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(getTotalRevenue())}</p>
              </div>
              <DollarSign size={24} className="text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* エンゲージメント統計 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">いいね率</p>
                <p className="text-2xl font-bold text-white">{analytics.likeRate.toFixed(1)}%</p>
              </div>
              <Heart size={24} className="text-red-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">シェア数</p>
                <p className="text-2xl font-bold text-white">{analytics.shareCount}</p>
              </div>
              <Share size={24} className="text-purple-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">コメント数</p>
                <p className="text-2xl font-bold text-white">{analytics.commentCount}</p>
              </div>
              <MessageCircle size={24} className="text-orange-400" />
            </div>
          </Card>
        </div>

        {/* 時間帯別視聴数 */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 size={20} className="mr-2" />
              時間帯別視聴数
            </h3>
            <div className="text-sm text-gray-400">
              ピーク時間: {getPeakHour()}時
            </div>
          </div>
          
          <div className="space-y-2">
            {analytics.hourlyViews.map((hourData) => (
              <div key={hourData.hour} className="flex items-center">
                <div className="w-12 text-sm text-gray-400">
                  {hourData.hour.toString().padStart(2, '0')}時
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-surface-light rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(hourData.views / Math.max(...analytics.hourlyViews.map(h => h.views))) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-white text-right">
                  {hourData.views}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 日別視聴数（過去30日） */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white flex items-center mb-6">
            <TrendingUp size={20} className="mr-2" />
            日別視聴数（過去30日）
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.dailyViews.map((dayData) => {
              const date = new Date(dayData.date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={dayData.date} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-white'}`}>
                      {date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      {isToday && <span className="ml-2 text-xs">今日</span>}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDuration(dayData.watchTime)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-sm text-white">
                      {dayData.views}回
                    </div>
                    <div className="text-sm text-green-400">
                      {formatCurrency(dayData.revenue)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
};
