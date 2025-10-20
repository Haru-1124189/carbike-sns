import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/init';

// スレッド投稿を固定/固定解除
export const toggleThreadPin = async (threadId: string, userId: string, isPinned: boolean) => {
  try {
    const threadRef = doc(db, 'threads', threadId);
    
    await updateDoc(threadRef, {
      isPinned: isPinned,
      pinnedAt: isPinned ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling thread pin:', error);
    throw new Error(`投稿の固定に失敗しました: ${error.message}`);
  }
};

// メンテナンス投稿を固定/固定解除
export const toggleMaintenancePin = async (postId: string, userId: string, isPinned: boolean) => {
  try {
    const postRef = doc(db, 'maintenance_posts', postId);
    
    await updateDoc(postRef, {
      isPinned: isPinned,
      pinnedAt: isPinned ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling maintenance pin:', error);
    throw new Error(`整備記録の固定に失敗しました: ${error.message}`);
  }
};

// 返信を固定/固定解除
export const toggleReplyPin = async (replyId: string, userId: string, isPinned: boolean) => {
  try {
    const replyRef = doc(db, 'replies', replyId);
    
    await updateDoc(replyRef, {
      isPinned: isPinned,
      pinnedAt: isPinned ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling reply pin:', error);
    throw new Error(`返信の固定に失敗しました: ${error.message}`);
  }
};
