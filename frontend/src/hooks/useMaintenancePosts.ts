import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/clients';
import { MaintenancePostDoc } from '../types';
import { canViewUserContent } from '../lib/privacy';

interface UseMaintenancePostsOptions {
  currentUserId?: string; // プライバシーフィルタリング用
}

export const useMaintenancePosts = (options: UseMaintenancePostsOptions = {}) => {
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

        // プライバシーフィルタリング
        if (options.currentUserId) {
          const privacyFilteredPosts = await Promise.all(
            posts.map(async (post) => {
              if (!post.authorId) return post; // 投稿者IDがない場合は表示
              
              const canView = await canViewUserContent(post.authorId, options.currentUserId!);
              return canView ? post : null;
            })
          );
          
          const filteredPosts = privacyFilteredPosts.filter(post => post !== null) as MaintenancePostDoc[];
          
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
        } else {
          // 固定された投稿を最初に表示し、その後は新着順にソート
          const sortedPosts = posts.sort((a, b) => {
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
        }
        
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching maintenance posts:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [options.currentUserId]);

  const refresh = () => {
    setLoading(true);
    setError(null);
  };

  return { maintenancePosts, loading, error, refresh };
};
