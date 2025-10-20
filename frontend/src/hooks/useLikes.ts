import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { getLikeHistory, LikeTarget, toggleLike } from '../lib/likes';

export const useLikes = (targetId: string, userId: string, targetType: LikeTarget = 'thread') => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetId || !userId) {
      setIsLiked(false);
      setLikeCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // ユーザーのいいね状態を監視
    const userLikeQuery = query(
      collection(db, 'likes'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      where('userId', '==', userId)
    );

    const unsubscribeUserLike = onSnapshot(
      userLikeQuery,
      (snapshot) => {
        setIsLiked(!snapshot.empty);
      },
      (err) => {
        console.error('Error fetching user like:', err);
        console.log('Permission error for user likes, assuming not liked');
        // 権限エラーの場合は、いいねしていないものとして処理
        setIsLiked(false);
        // エラーは無視してローディング完了
      }
    );

    // いいね総数を監視（スレッド/メンテナンス投稿/ツーリングスレッドのlikesフィールドから取得）
    const collectionName = targetType === 'thread' ? 'threads' : 
                          targetType === 'maintenance' ? 'maintenance_posts' : 
                          targetType === 'touring' ? 'touringThreads' : 'threads';
    const targetRef = doc(db, collectionName, targetId);

    const unsubscribeAllLikes = onSnapshot(
      targetRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setLikeCount(data.likes || 0);
        } else {
          setLikeCount(0);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching target document for likes count:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeUserLike();
      unsubscribeAllLikes();
    };
  }, [targetId, userId, targetType]);

  const handleToggleLike = async () => {
    if (!targetId || !userId) return;
    
    try {
      await toggleLike(targetId, userId, targetType);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError(error instanceof Error ? error.message : 'いいねの処理に失敗しました');
    }
  };

  return { isLiked, likeCount, loading, error, toggleLike: handleToggleLike };
};

// スレッド専用のいいねフック（後方互換性のため）
export const useThreadLikes = (threadId: string, userId: string) => {
  return useLikes(threadId, userId, 'thread');
};

// メンテナンス投稿専用のいいねフック
export const useMaintenanceLikes = (maintenanceId: string, userId: string) => {
  return useLikes(maintenanceId, userId, 'maintenance');
};

// ツーリングスレッド専用のいいねフック
export const useTouringLikes = (touringId: string, userId: string) => {
  return useLikes(touringId, userId, 'touring');
};

// いいね履歴を取得するフック
export const useLikeHistory = (targetId: string, targetType: LikeTarget = 'thread') => {
  const [likeHistory, setLikeHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetId) {
      setLikeHistory([]);
      setLoading(false);
      return;
    }

    const fetchLikeHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await getLikeHistory(targetId, targetType);
        setLikeHistory(history);
      } catch (err) {
        console.error('Error fetching like history:', err);
        setError(err instanceof Error ? err.message : 'いいね履歴の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchLikeHistory();
  }, [targetId, targetType]);

  return { likeHistory, loading, error };
};
