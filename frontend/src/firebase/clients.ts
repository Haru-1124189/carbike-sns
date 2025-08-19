import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { app } from './init';

export const auth = getAuth(app);

// 認証状態をローカルストレージに永続化
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Auth persistence set to local');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

export const db = getFirestore(app);
export const storage = getStorage(app);
