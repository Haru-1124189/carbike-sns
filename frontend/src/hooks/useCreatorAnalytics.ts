import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { Video } from '../types';

interface CreatorAnalyticsData {
  totalVideos: number;
  totalViews: number;
  totalWatchTime: number;
  totalLikes: number;
  totalComments: number;
  totalSubscribers: number;
  totalRevenue: number;
  averageViewsPerVideo: number;
  averageWatchTime: number;
  mostPopularVideo: any;
  recentVideos: any[];
  monthlyStats: {
    month: string;
    views: number;
    revenue: number;
    videos: number;
  }[];
  topVideos: any[];
  engagementRate: number;
  lastUpdated: Date;
}

export const useCreatorAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState<CreatorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // ユーザーの動画を取得
        const videosQuery = query(
          collection(db, 'videos'),
          where('authorId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const videosSnapshot = await getDocs(videosQuery);
        const videos = videosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Video[];

        if (videos.length === 0) {
          setAnalytics(null);
          setLoading(false);
          return;
        }

        // 登録者数を取得
        const subscribersQuery = query(
          collection(db, 'channelSubscriptions'),
          where('channelId', '==', userId)
        );
        const subscribersSnapshot = await getDocs(subscribersQuery);
        const totalSubscribers = subscribersSnapshot.size;

        // コメント数を取得
        let totalComments = 0;
        for (const video of videos) {
          const commentsQuery = query(
            collection(db, 'videoComments'),
            where('videoId', '==', video.id)
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          totalComments += commentsSnapshot.size;
        }

        // 動画のいいね数を取得
        let totalLikesFromDB = 0;
        for (const video of videos) {
          const likesQuery = query(
            collection(db, 'videoLikes'),
            where('videoId', '==', video.id)
          );
          const likesSnapshot = await getDocs(likesQuery);
          totalLikesFromDB += likesSnapshot.size;
        }

        // 基本統計を計算
        const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
        const totalLikes = totalLikesFromDB; // 実際のいいね数を使用
        const totalWatchTime = videos.reduce((sum, video) => sum + ((video.views || 0) * (video.duration || 180)), 0);
        const averageViewsPerVideo = Math.floor(totalViews / videos.length);
        const averageWatchTime = videos.length > 0 ? Math.floor(totalWatchTime / videos.length) : 0;

        // 収益計算（1再生あたり0.5円と仮定）
        const totalRevenue = Math.floor(totalViews * 0.5);

        // エンゲージメント率計算
        const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

        // 人気動画を取得
        const mostPopularVideo = videos.reduce((max, current) => 
          (current.views || 0) > (max.views || 0) ? current : max
        );

        // トップ5動画
        const topVideos = videos
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);

        // 月別統計を計算
        const monthlyStats = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          
          const monthVideos = videos.filter(video => {
            const videoDate = video.createdAt?.toDate?.() || new Date(video.createdAt);
            return videoDate >= date && videoDate < nextDate;
          });
          
          const monthViews = monthVideos.reduce((sum, video) => sum + (video.views || 0), 0);
          const monthRevenue = Math.floor(monthViews * 0.5);
          
          monthlyStats.push({
            month: date.toLocaleDateString('ja-JP', { month: 'short' }),
            views: monthViews,
            revenue: monthRevenue,
            videos: monthVideos.length
          });
        }

        const analyticsData: CreatorAnalyticsData = {
          totalVideos: videos.length,
          totalViews,
          totalWatchTime,
          totalLikes,
          totalComments,
          totalSubscribers,
          totalRevenue,
          averageViewsPerVideo,
          averageWatchTime,
          mostPopularVideo,
          recentVideos: videos.slice(-5).reverse(),
          monthlyStats,
          topVideos,
          engagementRate,
          lastUpdated: new Date()
        };

        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Error fetching creator analytics:', err);
        setError('分析データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  return { analytics, loading, error };
};
