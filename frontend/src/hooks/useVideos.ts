import { addDoc, collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { Video } from '../types';

export const useVideos = (userId?: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // すべての動画を取得（許可されたユーザーと管理者のみ）
  useEffect(() => {
    const q = query(
      collection(db, 'videos'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoList: Video[] = [];
      snapshot.forEach((doc) => {
        const videoData = doc.data();
        // クライアントサイドでstatusフィルタリング
        if (videoData.status === 'active') {
          videoList.push({ id: doc.id, ...videoData } as Video);
        }
      });
      setVideos(videoList);
    }, (err) => {
      console.error('Error fetching videos:', err);
      setError(err.message);
    });

    return () => unsubscribe();
  }, []);

  // ユーザーの動画を取得
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'videos'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userVideoList: Video[] = [];
      snapshot.forEach((doc) => {
        const videoData = doc.data();
        // クライアントサイドでauthorIdフィルタリング
        if (videoData.authorId === userId) {
          userVideoList.push({ id: doc.id, ...videoData } as Video);
        }
      });
      setUserVideos(userVideoList);
    }, (err) => {
      console.error('Error fetching user videos:', err);
      setError(err.message);
    });

    return () => unsubscribe();
  }, [userId]);

  // 動画をアップロード
  const uploadVideo = async (videoData: any, authorName: string) => {
    if (!userId) {
      throw new Error('ユーザーIDが必要です');
    }

    setLoading(true);
    setError(null);

    try {
      const newVideo = {
        title: videoData.title,
        description: videoData.description,
        thumbnailUrl: videoData.thumbnailUrl,
        videoUrl: videoData.videoUrl,
        duration: videoData.duration,
        tags: videoData.tags || [],
        category: videoData.category,
        visibility: videoData.visibility || 'public',
        ageRestriction: videoData.ageRestriction || false,
        authorId: userId,
        author: authorName,
        channelId: userId, // ユーザーIDをチャンネルIDとして使用
        views: 0,
        likes: 0,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        uploadedAt: new Date().toLocaleDateString('ja-JP'),
      };

      const docRef = await addDoc(collection(db, 'videos'), newVideo);
      return docRef.id;
    } catch (err: any) {
      console.error('Error uploading video:', err);
      setError(err.message);
      throw new Error('動画のアップロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 動画を更新
  const updateVideo = async (videoId: string, updates: Partial<Video>) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'videos', videoId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error updating video:', err);
      setError(err.message);
      throw new Error('動画の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 動画を削除
  const deleteVideo = async (videoId: string) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'videos', videoId);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Error deleting video:', err);
      setError(err.message);
      throw new Error('動画の削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 動画の視聴回数を増加
  const incrementViews = async (videoId: string) => {
    try {
      const docRef = doc(db, 'videos', videoId);
      await updateDoc(docRef, {
        views: increment(1),
      });
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  return {
    videos,
    userVideos,
    loading,
    error,
    uploadVideo,
    updateVideo,
    deleteVideo,
    incrementViews,
  };
};
