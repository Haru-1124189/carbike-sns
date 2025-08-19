import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/clients';
import { MaintenancePostDoc } from '../types';

export const useMaintenancePosts = () => {
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
      (snapshot) => {
        const posts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MaintenancePostDoc[];
        
        setMaintenancePosts(posts);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching maintenance posts:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
  };

  return { maintenancePosts, loading, error, refresh };
};
