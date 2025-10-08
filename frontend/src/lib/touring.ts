import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/init';
import { TouringChatMessage, TouringChatRoom, TouringReply, TouringThread } from '../types';

const TOURING_THREADS_COLLECTION = 'touringThreads';
const TOURING_CHAT_ROOMS_COLLECTION = 'touringChatRooms';
const TOURING_MESSAGES_COLLECTION = 'touringMessages';
const TOURING_REPLIES_COLLECTION = 'touringReplies';

// ツーリングスレッドの作成
export const createTouringThread = async (threadData: Omit<TouringThread, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('Creating touring thread with data:', threadData);
    console.log('Firestore db instance:', db);
    
    // undefinedの値を除外してFirestoreに保存
    const cleanData = Object.fromEntries(
      Object.entries(threadData).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, TOURING_THREADS_COLLECTION), {
      ...cleanData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('Touring thread created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating touring thread:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('ツーリングスレッドの作成に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// ツーリングスレッドの取得（リアルタイム）
export const subscribeTouringThreads = (callback: (threads: TouringThread[]) => void) => {
  const q = query(
    collection(db, TOURING_THREADS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const threads: TouringThread[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt || new Date(),
      updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt || new Date(),
      touringDate: doc.data().touringDate,
      applicationDeadline: doc.data().applicationDeadline
    })) as TouringThread[];
    
    callback(threads);
  });
};

// アクティブなツーリングスレッドの取得
export const getActiveTouringThreads = async (): Promise<TouringThread[]> => {
  try {
    const q = query(
      collection(db, TOURING_THREADS_COLLECTION),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt || new Date(),
      updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt || new Date(),
      touringDate: doc.data().touringDate,
      applicationDeadline: doc.data().applicationDeadline
    })) as TouringThread[];
  } catch (error) {
    console.error('Error getting active touring threads:', error);
    throw new Error('ツーリングスレッドの取得に失敗しました');
  }
};

// ツーリングスレッドへの参加
export const joinTouringThread = async (threadId: string, userId: string): Promise<void> => {
  try {
    const threadRef = doc(db, TOURING_THREADS_COLLECTION, threadId);
    const thread = await getDocs(query(collection(db, TOURING_THREADS_COLLECTION), where('__name__', '==', threadId)));
    
    if (thread.empty) {
      throw new Error('ツーリングスレッドが見つかりません');
    }
    
    const threadData = thread.docs[0].data();
    const currentParticipants = threadData.participants || [];
    
    if (currentParticipants.includes(userId)) {
      throw new Error('既に参加しています');
    }
    
    await updateDoc(threadRef, {
      participants: [...currentParticipants, userId],
      currentParticipants: currentParticipants.length + 1,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error joining touring thread:', error);
    throw error;
  }
};

// ツーリングスレッドからの退出
export const leaveTouringThread = async (threadId: string, userId: string): Promise<void> => {
  try {
    const threadRef = doc(db, TOURING_THREADS_COLLECTION, threadId);
    const thread = await getDocs(query(collection(db, TOURING_THREADS_COLLECTION), where('__name__', '==', threadId)));
    
    if (thread.empty) {
      throw new Error('ツーリングスレッドが見つかりません');
    }
    
    const threadData = thread.docs[0].data();
    const currentParticipants = threadData.participants || [];
    
    await updateDoc(threadRef, {
      participants: currentParticipants.filter((id: string) => id !== userId),
      currentParticipants: Math.max(0, currentParticipants.length - 1),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error leaving touring thread:', error);
    throw error;
  }
};

// ツーリングスレッドの削除
export const deleteTouringThread = async (threadId: string, userId: string): Promise<void> => {
  try {
    const threadRef = doc(db, TOURING_THREADS_COLLECTION, threadId);
    const thread = await getDocs(query(collection(db, TOURING_THREADS_COLLECTION), where('__name__', '==', threadId)));
    
    if (thread.empty) {
      throw new Error('ツーリングスレッドが見つかりません');
    }
    
    const threadData = thread.docs[0].data();
    if (threadData.authorId !== userId) {
      throw new Error('投稿者以外は削除できません');
    }
    
    await deleteDoc(threadRef);
  } catch (error) {
    console.error('Error deleting touring thread:', error);
    throw error;
  }
};

// ツーリングスレッドの状態更新
export const updateTouringThreadStatus = async (threadId: string, status: 'active' | 'closed' | 'completed' | 'cancelled'): Promise<void> => {
  try {
    const threadRef = doc(db, TOURING_THREADS_COLLECTION, threadId);
    await updateDoc(threadRef, {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating touring thread status:', error);
    throw error;
  }
};

// チャットルームの作成
export const createTouringChatRoom = async (touringThreadId: string, participants: string[], expiresAt: Date): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, TOURING_CHAT_ROOMS_COLLECTION), {
      touringThreadId,
      participants,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating touring chat room:', error);
    throw new Error('チャットルームの作成に失敗しました');
  }
};



// チャットルームの取得
export const getTouringChatRoom = async (chatRoomId: string): Promise<TouringChatRoom | null> => {
  try {
    const roomRef = doc(db, TOURING_CHAT_ROOMS_COLLECTION, chatRoomId);
    const room = await getDocs(query(collection(db, TOURING_CHAT_ROOMS_COLLECTION), where('__name__', '==', chatRoomId)));
    
    if (room.empty) {
      return null;
    }
    
    const roomData = room.docs[0].data();
    return {
      id: room.docs[0].id,
      ...roomData,
      createdAt: roomData.createdAt?.toDate ? roomData.createdAt.toDate() : roomData.createdAt || new Date(),
      expiresAt: roomData.expiresAt?.toDate ? roomData.expiresAt.toDate() : roomData.expiresAt || new Date()
    } as TouringChatRoom;
  } catch (error) {
    console.error('Error getting touring chat room:', error);
    throw error;
  }
};


// ツーリングスレッドの返信数増加
export const incrementTouringThreadReplies = async (threadId: string): Promise<void> => {
  try {
    const threadRef = doc(db, TOURING_THREADS_COLLECTION, threadId);
    const threadSnapshot = await getDocs(query(collection(db, TOURING_THREADS_COLLECTION), where('__name__', '==', threadId)));
    
    if (threadSnapshot.empty) {
      throw new Error('ツーリングスレッドが見つかりません');
    }
    
    const threadData = threadSnapshot.docs[0].data();
    const currentReplies = threadData.replies || 0;
    
    await updateDoc(threadRef, {
      replies: currentReplies + 1,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error incrementing touring thread replies:', error);
    throw error;
  }
};

// ツーリングスレッドの返信作成
export const createTouringReply = async (replyData: Omit<TouringReply, 'id' | 'createdAt'>): Promise<string> => {
  try {
    console.log('Creating touring reply with data:', replyData);
    
    const docRef = await addDoc(collection(db, TOURING_REPLIES_COLLECTION), {
      ...replyData,
      createdAt: Timestamp.now()
    });
    
    console.log('Touring reply saved to collection:', TOURING_REPLIES_COLLECTION);
    console.log('Touring reply threadId:', replyData.threadId);
    
    // ツーリングスレッドの返信数を増加
    await incrementTouringThreadReplies(replyData.threadId);
    
    console.log('Touring reply created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating touring reply:', error);
    throw error;
  }
};

// ツーリングスレッドの返信一覧を取得（リアルタイム）
export const subscribeTouringReplies = (
  threadId: string, 
  callback: (replies: TouringReply[]) => void,
  errorCallback?: (error: Error) => void
) => {
  console.log('subscribeTouringReplies called with threadId:', threadId);
  
  // 一時的にorderByを削除してテスト
  const q = query(
    collection(db, TOURING_REPLIES_COLLECTION),
    where('threadId', '==', threadId)
  );
  
  return onSnapshot(q, (snapshot) => {
    console.log('Touring replies snapshot received:', snapshot.size, 'replies');
    const replies: TouringReply[] = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Touring reply data:', data);
      return {
        id: doc.id,
        threadId: data.threadId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || '',
        content: data.content,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date()
      };
    });
    console.log('Processed touring replies:', replies);
    callback(replies);
  }, (error) => {
    console.error('Error fetching touring replies:', error);
    errorCallback?.(error);
  });
};

// 募集締切が過ぎたツーリングスレッドの自動参加者を決定し、チャットルームを作成
export const processExpiredTouringThreads = async (): Promise<void> => {
  try {
    console.log('Processing expired touring threads...');
    
    // 募集締切が過ぎたアクティブなツーリングスレッドを取得
    const now = new Date();
    const expiredQuery = query(
      collection(db, TOURING_THREADS_COLLECTION),
      where('status', '==', 'active'),
      where('applicationDeadline', '<', Timestamp.fromDate(now))
    );
    
    const expiredThreadsSnapshot = await getDocs(expiredQuery);
    console.log(`Found ${expiredThreadsSnapshot.size} expired touring threads`);
    
    for (const threadDoc of expiredThreadsSnapshot.docs) {
      const threadData = threadDoc.data();
      const threadId = threadDoc.id;
      
      console.log(`Processing expired thread: ${threadId}`);
      
      // 既にチャットルームが作成されている場合はスキップ
      if (threadData.chatRoomId) {
        console.log(`Chat room already exists for thread: ${threadId}`);
        continue;
      }
      
      // 自動参加者を決定（いいねまたは返信したユーザー + 投稿者）
      const autoParticipants = new Set<string>();
      
      // 投稿者を追加
      if (threadData.authorId) {
        autoParticipants.add(threadData.authorId);
      }
      
      // いいねしたユーザーを取得
      const likesQuery = query(
        collection(db, 'likes'),
        where('targetId', '==', threadId),
        where('targetType', '==', 'touring')
      );
      const likesSnapshot = await getDocs(likesQuery);
      likesSnapshot.docs.forEach(likeDoc => {
        const likeData = likeDoc.data();
        if (likeData.userId) {
          autoParticipants.add(likeData.userId);
        }
      });
      
      // 返信したユーザーを取得
      const repliesQuery = query(
        collection(db, TOURING_REPLIES_COLLECTION),
        where('threadId', '==', threadId)
      );
      const repliesSnapshot = await getDocs(repliesQuery);
      repliesSnapshot.docs.forEach(replyDoc => {
        const replyData = replyDoc.data();
        if (replyData.authorId) {
          autoParticipants.add(replyData.authorId);
        }
      });
      
      const participants = Array.from(autoParticipants);
      console.log(`Auto participants for thread ${threadId}:`, participants);
      
      // 参加者が2人以上いる場合のみチャットルームを作成
      if (participants.length >= 2) {
        // ツーリング日時を取得
        const touringDate = threadData.touringDate?.toDate ? threadData.touringDate.toDate() : threadData.touringDate || new Date();
        // ツーリング日時の24時間後をチャットルームの有効期限とする
        const expiresAt = new Date(touringDate.getTime() + 24 * 60 * 60 * 1000);
        
        // チャットルームを作成
        const chatRoomId = await createTouringChatRoom(threadId, participants, expiresAt);
        console.log(`Created chat room ${chatRoomId} for thread ${threadId}`);
        
        // ツーリングスレッドのステータスを更新
        await updateDoc(doc(db, TOURING_THREADS_COLLECTION, threadId), {
          status: 'closed',
          chatRoomId: chatRoomId,
          updatedAt: Timestamp.now()
        });
        
        console.log(`Updated thread ${threadId} status to closed`);
      } else {
        console.log(`Not enough participants for thread ${threadId}, marking as cancelled`);
        // 参加者が少ない場合はキャンセル
        await updateDoc(doc(db, TOURING_THREADS_COLLECTION, threadId), {
          status: 'cancelled',
          updatedAt: Timestamp.now()
        });
      }
    }
    
    console.log('Finished processing expired touring threads');
  } catch (error) {
    console.error('Error processing expired touring threads:', error);
    throw error;
  }
};

// 期限切れのチャットルームを自動解散
export const processExpiredChatRooms = async (): Promise<void> => {
  try {
    console.log('Processing expired chat rooms...');
    
    // 現在時刻より前の有効期限を持つアクティブなチャットルームを取得
    const now = new Date();
    const expiredQuery = query(
      collection(db, TOURING_CHAT_ROOMS_COLLECTION),
      where('status', '==', 'active'),
      where('expiresAt', '<', Timestamp.fromDate(now))
    );
    
    const expiredChatRoomsSnapshot = await getDocs(expiredQuery);
    console.log(`Found ${expiredChatRoomsSnapshot.size} expired chat rooms`);
    
    for (const chatRoomDoc of expiredChatRoomsSnapshot.docs) {
      const chatRoomData = chatRoomDoc.data();
      const chatRoomId = chatRoomDoc.id;
      
      console.log(`Processing expired chat room: ${chatRoomId}`);
      
      // チャットルームのステータスを解散済みに更新
      await updateDoc(doc(db, TOURING_CHAT_ROOMS_COLLECTION, chatRoomId), {
        status: 'expired',
        updatedAt: Timestamp.now()
      });
      
      console.log(`Chat room ${chatRoomId} has been expired`);
      
      // 関連するツーリングスレッドのステータスも更新
      if (chatRoomData.touringThreadId) {
        const threadRef = doc(db, TOURING_THREADS_COLLECTION, chatRoomData.touringThreadId);
        await updateDoc(threadRef, {
          status: 'completed',
          updatedAt: Timestamp.now()
        });
        console.log(`Touring thread ${chatRoomData.touringThreadId} status updated to completed`);
      }
    }
    
    console.log('Finished processing expired chat rooms');
  } catch (error) {
    console.error('Error processing expired chat rooms:', error);
    throw error;
  }
};

// ユーザーが参加予定のツーリングスレッド（チャットルームがあるもの）を取得
export const getUserParticipatingThreads = async (userId: string): Promise<TouringThread[]> => {
  try {
    console.log('Getting participating threads for user:', userId);
    
    // ユーザーが参加しているチャットルームを取得
    const chatRoomsQuery = query(
      collection(db, TOURING_CHAT_ROOMS_COLLECTION),
      where('participants', 'array-contains', userId),
      where('status', '==', 'active')
    );
    
    const chatRoomsSnapshot = await getDocs(chatRoomsQuery);
    console.log(`Found ${chatRoomsSnapshot.size} active chat rooms for user`);
    
    const participatingThreads: TouringThread[] = [];
    
    for (const chatRoomDoc of chatRoomsSnapshot.docs) {
      const chatRoomData = chatRoomDoc.data();
      const touringThreadId = chatRoomData.touringThreadId;
      
      // 対応するツーリングスレッドを取得
      const threadDoc = await getDoc(doc(db, TOURING_THREADS_COLLECTION, touringThreadId));
      if (threadDoc.exists()) {
        const threadData = threadDoc.data();
        participatingThreads.push({
          id: threadDoc.id,
          title: threadData.title,
          description: threadData.description,
          authorId: threadData.authorId,
          authorName: threadData.authorName,
          authorAvatar: threadData.authorAvatar || '',
          prefecture: threadData.prefecture,
          location: threadData.location,
          touringDate: threadData.touringDate?.toDate ? threadData.touringDate.toDate() : threadData.touringDate || new Date(),
          applicationDeadline: threadData.applicationDeadline?.toDate ? threadData.applicationDeadline.toDate() : threadData.applicationDeadline || new Date(),
          maxParticipants: threadData.maxParticipants,
          currentParticipants: threadData.currentParticipants,
          participants: threadData.participants,
          replies: threadData.replies,
          likes: threadData.likes,
          tags: threadData.tags,
          status: threadData.status,
          chatRoomId: threadData.chatRoomId,
          createdAt: threadData.createdAt?.toDate ? threadData.createdAt.toDate() : threadData.createdAt || new Date(),
          updatedAt: threadData.updatedAt?.toDate ? threadData.updatedAt.toDate() : threadData.updatedAt || new Date()
        });
      }
    }
    
    console.log(`Found ${participatingThreads.length} participating threads`);
    return participatingThreads;
  } catch (error) {
    console.error('Error getting participating threads:', error);
    throw error;
  }
};

// ツーリングチャットメッセージを送信
export const sendTouringChatMessage = async (
  chatRoomId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | null,
  content: string
): Promise<string> => {
  try {
    console.log('Sending touring chat message:', { chatRoomId, senderId, content });
    
    const messageData = {
      chatRoomId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || '',
      content,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, TOURING_MESSAGES_COLLECTION), messageData);
    console.log('Touring chat message sent with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending touring chat message:', error);
    throw error;
  }
};

// ツーリングチャットメッセージをリアルタイムで取得
export const subscribeTouringChatMessages = (
  chatRoomId: string,
  callback: (messages: TouringChatMessage[]) => void,
  errorCallback?: (error: Error) => void
) => {
  console.log('Subscribing to touring chat messages for room:', chatRoomId);
  
  const messagesQuery = query(
    collection(db, TOURING_MESSAGES_COLLECTION),
    where('chatRoomId', '==', chatRoomId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    console.log(`Received ${snapshot.size} chat messages for room ${chatRoomId}`);
    const messages: TouringChatMessage[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        chatRoomId: data.chatRoomId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar || '',
        content: data.content,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date()
      };
    });
    console.log('Processed touring chat messages:', messages);
    callback(messages);
  }, (error) => {
    console.error('Error fetching touring chat messages:', error);
    errorCallback?.(error);
  });
};

// 早期締切処理（投稿主が手動で締切）
export const earlyCloseTouringThread = async (threadId: string, authorId: string): Promise<void> => {
  console.log('Early closing touring thread:', threadId);
  
  const threadRef = doc(db, TOURING_THREADS_COLLECTION, threadId);
  const threadDoc = await getDoc(threadRef);
  
  if (!threadDoc.exists()) {
    throw new Error('ツーリングスレッドが見つかりません');
  }
  
  const threadData = threadDoc.data();
  
  // 投稿主でない場合はエラー
  if (threadData.authorId !== authorId) {
    throw new Error('投稿主のみ早期締切できます');
  }
  
  // 既に締切済みの場合はエラー
  if (threadData.status !== 'active') {
    throw new Error('既に締切済みです');
  }
  
  try {
    // 参加者を決定（投稿主 + いいねした人 + 返信した人）
    const [likesSnapshot, repliesSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'likes'), 
        where('targetId', '==', threadId), 
        where('targetType', '==', 'touring'))),
      getDocs(query(collection(db, TOURING_REPLIES_COLLECTION), 
        where('threadId', '==', threadId)))
    ]);
    
    const participantIds = new Set<string>();
    participantIds.add(authorId); // 投稿主を追加
    
    // いいねした人を追加
    likesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        participantIds.add(data.userId);
      }
    });
    
    // 返信した人を追加
    repliesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.authorId) {
        participantIds.add(data.authorId);
      }
    });
    
    const participants = Array.from(participantIds);
    console.log('Early close participants:', participants);
    
    // チャットルームを作成
    const chatRoomData: Omit<TouringChatRoom, 'id'> = {
      touringThreadId: threadId,
      participants: participants,
      createdAt: new Date(),
      expiresAt: new Date(threadData.touringDate), // ツーリング日時に設定
      status: 'active'
    };
    
    const chatRoomRef = await addDoc(collection(db, TOURING_CHAT_ROOMS_COLLECTION), chatRoomData);
    console.log('Created chat room:', chatRoomRef.id);
    
    // スレッドを更新（status: 'closed', chatRoomId: チャットルームID）
    await updateDoc(threadRef, {
      status: 'closed',
      chatRoomId: chatRoomRef.id,
      updatedAt: new Date()
    });
    
    console.log('Early closed touring thread:', threadId);
    
  } catch (error) {
    console.error('Error in early close touring thread:', error);
    throw error;
  }
};

// 近くのツーリングスレッドを検索
export const getNearbyTouringThreads = async (
  userPrefecture: string,
  userCity?: string,
  radiusKm: number = 50
): Promise<TouringThread[]> => {
  console.log('Searching nearby touring threads:', { userPrefecture, userCity, radiusKm });
  
  try {
    // まず同じ都道府県のツーリングを取得
    const threadsSnapshot = await getDocs(
      query(
        collection(db, TOURING_THREADS_COLLECTION),
        where('status', '==', 'active'),
        where('prefecture', '==', userPrefecture)
      )
    );
    
    const nearbyThreads: TouringThread[] = [];
    
    threadsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // 同じ都道府県内なら基本的に近いとみなす
      // より詳細な距離計算が必要な場合は、市区町村や座標を使用
      if (userCity && data.location) {
        // 市区町村レベルでの一致チェック（簡易版）
        const isNearby = data.location.includes(userCity) || 
                        userCity.includes(data.location) ||
                        data.prefecture === userPrefecture;
        
        if (isNearby) {
          nearbyThreads.push({
            id: doc.id,
            title: data.title || '',
            description: data.description,
            authorId: data.authorId,
            authorName: data.authorName,
            authorAvatar: data.authorAvatar || '',
            prefecture: data.prefecture,
            location: data.location,
            touringDate: data.touringDate?.toDate ? data.touringDate.toDate() : data.touringDate || new Date(),
            applicationDeadline: data.applicationDeadline?.toDate ? data.applicationDeadline.toDate() : data.applicationDeadline || new Date(),
            maxParticipants: data.maxParticipants,
            currentParticipants: data.currentParticipants,
            participants: data.participants,
            replies: data.replies,
            likes: data.likes,
            tags: data.tags,
            status: data.status,
            chatRoomId: data.chatRoomId,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date()
          });
        }
      } else {
        // 市区町村情報がない場合は都道府県のみで判定
        nearbyThreads.push({
          id: doc.id,
          title: data.title || '',
          description: data.description,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar || '',
          prefecture: data.prefecture,
          location: data.location,
          touringDate: data.touringDate?.toDate ? data.touringDate.toDate() : data.touringDate || new Date(),
          applicationDeadline: data.applicationDeadline?.toDate ? data.applicationDeadline.toDate() : data.applicationDeadline || new Date(),
          maxParticipants: data.maxParticipants,
          currentParticipants: data.currentParticipants,
          participants: data.participants,
          replies: data.replies,
          likes: data.likes,
          tags: data.tags,
          status: data.status,
          chatRoomId: data.chatRoomId,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date()
        });
      }
    });
    
    console.log(`Found ${nearbyThreads.length} nearby touring threads`);
    return nearbyThreads;
    
  } catch (error) {
    console.error('Error searching nearby touring threads:', error);
    throw error;
  }
};

// 新しいツーリングスレッドが作成された際に近くのユーザーに通知を送信
export const notifyNearbyUsers = async (newThread: TouringThread): Promise<void> => {
  console.log('Notifying nearby users for new thread:', newThread.id);
  
  try {
    // 通知を有効にしているユーザーを取得
    const usersSnapshot = await getDocs(
      query(
        collection(db, 'users'),
        where('address.isNotificationEnabled', '==', true),
        where('address.prefecture', '==', newThread.prefecture)
      )
    );
    
    const notifications: any[] = [];
    
    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const userAddress = userData.address;
      
      if (userAddress && userAddress.isNotificationEnabled) {
        // 距離チェック（簡易版）
        let shouldNotify = false;
        
        if (userAddress.city && newThread.location) {
          // 市区町村レベルでの一致チェック
          shouldNotify = newThread.location.includes(userAddress.city) || 
                        userAddress.city.includes(newThread.location);
        } else {
          // 都道府県レベルでの一致
          shouldNotify = true;
        }
        
        if (shouldNotify) {
          notifications.push({
            userId: userDoc.id,
            type: 'nearby_touring',
            title: '近くでツーリング募集がありました！',
            content: `${newThread.prefecture}でツーリングが募集されています`,
            data: {
              threadId: newThread.id,
              prefecture: newThread.prefecture,
              location: newThread.location,
              touringDate: newThread.touringDate
            },
            isRead: false,
            createdAt: new Date()
          });
        }
      }
    });
    
    // 通知を一括作成
    if (notifications.length > 0) {
      const batch = writeBatch(db);
      notifications.forEach((notification) => {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, notification);
      });
      await batch.commit();
      
      console.log(`Sent ${notifications.length} nearby touring notifications`);
    }
    
  } catch (error) {
    console.error('Error notifying nearby users:', error);
    throw error;
  }
};
