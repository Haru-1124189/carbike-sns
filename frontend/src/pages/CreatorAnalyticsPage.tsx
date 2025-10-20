import { ArrowLeft, BarChart3, Calendar, DollarSign, Eye, Heart, MessageCircle, Play, TrendingUp, Users, Video } from 'lucide-react';
import React from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useCreatorAnalytics } from '../hooks/useCreatorAnalytics';

interface CreatorAnalyticsPageProps {
  onBackClick?: () => void;
}


export const CreatorAnalyticsPage: React.FC<CreatorAnalyticsPageProps> = ({
  onBackClick
}) => {
  const { user } = useAuth();
  const { analytics, loading, error } = useCreatorAnalytics(user?.uid);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    } else if (minutes > 0) {
      return `${minutes}分`;
    } else {
      return `${seconds}秒`;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `¥${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="p-4 pb-24 pt-0 fade-in max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg text-white">分析データを読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="p-4 pb-24 pt-0 fade-in max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={onBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-4"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">クリエイター分析</h1>
            </div>
          </div>
          
          <div className="text-center py-12">
            <div className="text-lg font-medium text-red-400 mb-2">エラーが発生しました</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!analytics || analytics.totalVideos === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="p-4 pb-24 pt-0 fade-in max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={onBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm mr-4"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">クリエイター分析</h1>
            </div>
          </div>
          
          <div className="text-center py-12">
            <Video size={48} className="text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-white mb-2">動画がありません</div>
            <div className="text-sm text-gray-400">動画をアップロードして分析データを確認しましょう</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="p-4 pb-24 pt-0 fade-in max-w-6xl mx-auto">
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
              <h1 className="text-2xl font-bold text-white">クリエイター分析</h1>
              <p className="text-sm text-gray-400">チャンネル全体の統計データ</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            最終更新: {analytics.lastUpdated.toLocaleString('ja-JP')}
          </div>
        </div>

        {/* 主要統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総動画数</p>
                <p className="text-2xl font-bold text-white">{analytics.totalVideos}</p>
              </div>
              <Video size={24} className="text-primary" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総再生回数</p>
                <p className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <Eye size={24} className="text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総視聴時間</p>
                <p className="text-2xl font-bold text-white">{formatDuration(analytics.totalWatchTime)}</p>
              </div>
              <Play size={24} className="text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総収益</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
              <DollarSign size={24} className="text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* エンゲージメント統計 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総いいね数</p>
                <p className="text-2xl font-bold text-white">{analytics.totalLikes.toLocaleString()}</p>
              </div>
              <Heart size={24} className="text-red-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総コメント数</p>
                <p className="text-2xl font-bold text-white">{analytics.totalComments.toLocaleString()}</p>
              </div>
              <MessageCircle size={24} className="text-orange-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">登録者数</p>
                <p className="text-2xl font-bold text-white">{analytics.totalSubscribers.toLocaleString()}</p>
              </div>
              <Users size={24} className="text-purple-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">エンゲージメント率</p>
                <p className="text-2xl font-bold text-white">{analytics.engagementRate.toFixed(1)}%</p>
              </div>
              <TrendingUp size={24} className="text-pink-400" />
            </div>
          </Card>
        </div>

        {/* 平均統計 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">平均再生回数/動画</p>
                <p className="text-2xl font-bold text-white">{analytics.averageViewsPerVideo.toLocaleString()}</p>
              </div>
              <BarChart3 size={24} className="text-cyan-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">平均視聴時間</p>
                <p className="text-2xl font-bold text-white">{formatDuration(analytics.averageWatchTime)}</p>
              </div>
              <Calendar size={24} className="text-indigo-400" />
            </div>
          </Card>
        </div>

        {/* 人気動画トップ5 */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-white flex items-center mb-6">
            <TrendingUp size={20} className="mr-2" />
            人気動画トップ5
          </h3>
          
          <div className="space-y-4">
            {analytics.topVideos.map((video, index) => (
              <div key={video.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-gray-400">
                      {video.createdAt?.toDate?.()?.toLocaleDateString('ja-JP') || 
                       new Date(video.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-sm text-white">
                    {video.views?.toLocaleString() || 0}回
                  </div>
                  <div className="text-sm text-red-400">
                    ♥ {video.likes || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 月別統計（過去12ヶ月） */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white flex items-center mb-6">
            <BarChart3 size={20} className="mr-2" />
            月別統計（過去12ヶ月）
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.monthlyStats.map((monthData, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                <div className="text-sm font-medium text-white">
                  {monthData.month}
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-sm text-white">
                    {monthData.views.toLocaleString()}回
                  </div>
                  <div className="text-sm text-green-400">
                    {formatCurrency(monthData.revenue)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {monthData.videos}本
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};
