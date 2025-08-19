import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/clients';
import { LikeTarget } from '../lib/likes';

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
        setError(err.message);
      }
    );

    // いいね総数を監視
    const allLikesQuery = query(
      collection(db, 'likes'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType)
    );

    const unsubscribeAllLikes = onSnapshot(
      allLikesQuery,
      (snapshot) => {
        setLikeCount(snapshot.size);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching all likes:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeUserLike();
      unsubscribeAllLikes();
    };
  }, [targetId, userId, targetType]);

  return { isLiked, likeCount, loading, error };
};

// スレッド専用のいいねフック（後方互換性のため）
export const useThreadLikes = (threadId: string, userId: string) => {
  return useLikes(threadId, userId, 'thread');
};

// メンテナンス投稿専用のいいねフック
export const useMaintenanceLikes = (maintenanceId: string, userId: string) => {
  return useLikes(maintenanceId, userId, 'maintenance');
};
