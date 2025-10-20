import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';

export const useUserName = (authorId: string) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [photoURL, setPhotoURL] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorId) {
      setDisplayName('');
      setPhotoURL('');
      setLoading(false);
      return;
    }

    setLoading(true);

    const userDocRef = doc(db, 'users', authorId);
    
    const unsubscribe = onSnapshot(
      userDocRef,
      (userDocSnap) => {
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log(`useUserName: User found for ${authorId}:`, userData);
          setDisplayName(userData.displayName || 'ユーザー');
          setPhotoURL(userData.photoURL || '');
        } else {
          console.warn(`useUserName: User not found in Firestore: ${authorId}`);
          // より分かりやすいフォールバック名
          setDisplayName(`ユーザー${authorId.slice(-4)}`); // IDの最後4文字を使用
          setPhotoURL('');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user data:', error);
        // 権限エラーの場合は、デフォルト名を使用
        if (error instanceof Error && error.message.includes('permission')) {
          console.log('Permission error for user data fetch, using default data');
          setDisplayName(`ユーザー${authorId.slice(-4)}`);
          setPhotoURL('');
        } else {
          console.error(`useUserName: Unexpected error for ${authorId}:`, error);
          setDisplayName(`ユーザー${authorId.slice(-4)}`);
          setPhotoURL('');
        }
        setLoading(false);
      }
    );

    // クリーンアップ関数
    return () => unsubscribe();
  }, [authorId]);

  return { displayName, photoURL, loading };
};
