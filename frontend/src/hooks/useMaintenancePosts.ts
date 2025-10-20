import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { MaintenancePostDoc } from '../types';
import { filterMutedPosts } from '../utils/muteWords';

interface UseMaintenancePostsOptions {
  currentUserId?: string; // プライバシーフィルタリング用
  blockedUsers?: string[];
  mutedWords?: string[];
}

export const useMaintenancePosts = (options: UseMaintenancePostsOptions = {}) => {
  const { currentUserId, blockedUsers = [], mutedWords = [] } = options;
  const [maintenancePosts, setMaintenancePosts] = useState<MaintenancePostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'maintenance_posts'),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          } as MaintenancePostDoc;
        });

        // ブロックユーザーの投稿を除外
        let filteredPosts = posts;
        if (blockedUsers.length > 0) {
          filteredPosts = posts.filter(post => 
            !post.authorId || !blockedUsers.includes(post.authorId)
          );
        }

        // ミュートワードを含む投稿を除外
        if (mutedWords.length > 0) {
          filteredPosts = filterMutedPosts(filteredPosts, mutedWords);
        }

        // メンテ投稿は常に公開（鍵アカウントでも全員が閲覧可能）
        // 固定された投稿を最初に表示し、その後は新着順にソート
        const sortedPosts = filteredPosts.sort((a, b) => {
            // 固定された投稿を最初に
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            // 両方とも固定されている場合は固定日時順
            if (a.isPinned && b.isPinned) {
              const pinnedAtA = a.pinnedAt instanceof Date ? a.pinnedAt.getTime() : new Date(a.pinnedAt || 0).getTime();
              const pinnedAtB = b.pinnedAt instanceof Date ? b.pinnedAt.getTime() : new Date(b.pinnedAt || 0).getTime();
              return pinnedAtB - pinnedAtA; // 新しい固定を上に
            }
            
            // 固定されていない場合は作成日時順
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime(); // 新着順
          });
        
        setMaintenancePosts(sortedPosts);
        
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching maintenance posts:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId, blockedUsers, mutedWords]);

  const refresh = () => {
    setLoading(true);
    setError(null);
  };

  return { maintenancePosts, loading, error, refresh };
};
