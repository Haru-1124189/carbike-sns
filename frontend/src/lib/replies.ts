import { addDoc, collection, doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/clients';

export interface CreateReplyData {
  threadId: string;
  content: string;
}

export const createReply = async (data: CreateReplyData, userId: string, userName: string, userAvatar?: string) => {
  try {
    // 返信を作成
    const replyData = {
      threadId: data.threadId,
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar,
      content: data.content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
    };

    const docRef = await addDoc(collection(db, 'replies'), replyData);

    // スレッドの返信数を更新
    const threadRef = doc(db, 'threads', data.threadId);
    await updateDoc(threadRef, {
      replies: increment(1),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};
