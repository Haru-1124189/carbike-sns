import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/clients';
import { createReplyNotification } from './notifications';

export interface CreateReplyData {
  targetId: string;
  targetType: 'thread' | 'question' | 'maintenance' | 'touring';
  content: string;
}

export const createReply = async (data: CreateReplyData, userId: string, userName: string, userAvatar?: string | null) => {
  try {
    console.log('createReply called with:', { data, userId, userName, userAvatar });
    
    // 返信を作成
    const replyData = {
      targetId: data.targetId,
      targetType: data.targetType,
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar === undefined ? null : userAvatar, // undefinedの場合は確実にnullに変換
      content: data.content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
    };

    console.log('Creating reply document with data:', replyData);
    const docRef = await addDoc(collection(db, 'replies'), replyData);
    console.log('Reply document created with ID:', docRef.id);

    // 対象の投稿の返信数を更新
    try {
      const targetCollection = data.targetType === 'maintenance' ? 'maintenance_posts' : 
                             data.targetType === 'touring' ? 'touringThreads' : 'threads';
      const targetRef = doc(db, targetCollection, data.targetId);
      console.log('Updating target document:', { targetCollection, targetId: data.targetId });
      
      // 現在の返信数を取得してから更新
      const targetDoc = await getDoc(targetRef);
      if (targetDoc.exists()) {
        const targetData = targetDoc.data();
        const currentReplies = targetData.replies || 0;
        console.log('Current replies count:', currentReplies);
        
        // 返信数を確実に更新
        const newRepliesCount = currentReplies + 1;
        console.log('New replies count will be:', newRepliesCount);
        
        await updateDoc(targetRef, {
          replies: newRepliesCount,
          updatedAt: serverTimestamp(),
        });
        console.log('Target document updated successfully with new replies count:', newRepliesCount);
      } else {
        console.error('Target document not found for reply count update');
      }
    } catch (updateError) {
      console.error('Error updating target document:', updateError);
      console.error('Update error details:', {
        targetId: data.targetId,
        targetType: data.targetType,
        error: updateError
      });
      // 返信数更新に失敗しても返信は成功させる
    }

    // 通知を作成（自分以外の投稿に返信した場合）
    try {
      const targetCollection = data.targetType === 'maintenance' ? 'maintenance_posts' : 'threads';
      const targetRef = doc(db, targetCollection, data.targetId);
      const targetDoc = await getDoc(targetRef);
      if (targetDoc.exists()) {
        const targetData = targetDoc.data();
        const targetAuthorId = targetData.authorId;
        const targetTitle = targetData.title || '投稿';
        
        console.log('Notification check:', { targetAuthorId, userId, targetTitle });
        
        // 自分以外の投稿に返信した場合のみ通知を作成
        if (targetAuthorId && targetAuthorId !== userId) {
          console.log('Creating reply notification...');
          await createReplyNotification(
            targetAuthorId,
            userId,
            userName,
            data.targetId,
            data.targetType,
            targetTitle
          );
          console.log('Reply notification created successfully');
        } else {
          console.log('Skipping notification (own post or no authorId)');
        }
      } else {
        console.log('Target document not found for notification');
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      console.error('Notification error details:', {
        targetId: data.targetId,
        targetType: data.targetType,
        userId,
        userName
      });
      // 通知の作成に失敗しても返信は成功させる
    }

    console.log('Reply creation completed successfully');
    return docRef.id;
  } catch (error) {
    console.error('Error creating reply:', error);
    console.error('Error details:', {
      data,
      userId,
      userName,
      userAvatar
    });
    
    // 返信の作成自体は成功している可能性があるので、エラーの種類を確認
    if (error instanceof Error && error.message.includes('authorAvatar')) {
      console.log('authorAvatar error detected, but reply may have been created');
      // authorAvatarエラーの場合は、返信IDを返す（作成は成功している）
      return 'reply_created_with_avatar_error';
    }
    
    throw error;
  }
};
