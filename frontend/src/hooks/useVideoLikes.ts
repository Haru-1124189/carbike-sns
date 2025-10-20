import { collection, deleteDoc, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';

export const useVideoLikes = (videoId: string, userId?: string) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!videoId) return;

    // いいね数を取得
    const likesQuery = query(
      collection(db, 'videoLikes'),
      where('videoId', '==', videoId)
    );

    const unsubscribe = onSnapshot(likesQuery, (snapshot) => {
      setLikeCount(snapshot.size);
      
      // ユーザーがいいねしているかチェック
      if (userId) {
        const userLike = snapshot.docs.find(doc => doc.data().userId === userId);
        setIsLiked(!!userLike);
      }
    });

    return () => unsubscribe();
  }, [videoId, userId]);

  const toggleLike = async () => {
    if (!userId || !videoId) return;

    setLoading(true);
    try {
      const likeDocRef = doc(db, 'videoLikes', `${userId}_${videoId}`);
      
      if (isLiked) {
        // いいねを削除
        await deleteDoc(likeDocRef);
      } else {
        // いいねを追加
        await setDoc(likeDocRef, {
          videoId,
          userId,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error toggling video like:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likeCount, toggleLike, loading };
};
