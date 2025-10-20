import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/init';

export const incrementVideoView = async (videoId: string) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing video view:', error);
  }
};
