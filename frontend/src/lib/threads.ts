import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/clients';
import { ThreadDoc, MaintenancePostDoc } from '../types';

export interface CreateThreadData {
  title: string;
  content: string;
  type: 'post' | 'question';
  tags?: string[];
  vehicleKey?: string;
  authorAvatar?: string;
  images?: string[]; // 画像URLの配列を追加
}

export interface CreateMaintenanceData {
  title: string;
  content: string;
  carModel: string;
  mileage: number;
  cost: number;
  workDate: string;
  category: 'engine' | 'suspension' | 'brake' | 'electrical' | 'body' | 'tire' | 'oil' | 'custom' | 'other';
  tags?: string[];
  totalTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tools?: string[];
  parts?: string[];
  images?: string[];
  steps?: any[];
}

export const createThread = async (data: CreateThreadData, authorId: string, authorName: string) => {
  console.log('createThread - Debug:', { data, authorId, authorName });

  const threadData: Partial<ThreadDoc> = {
    title: data.title,
    content: data.content,
    type: data.type,
    tags: data.tags || [],
    authorId,
    authorName,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 0,
    replies: 0,
    isDeleted: false,
  };

  // vehicleKey、authorAvatar、imagesは存在する場合のみ追加
  if (data.vehicleKey) {
    threadData.vehicleKey = data.vehicleKey;
  }
  if (data.authorAvatar) {
    threadData.authorAvatar = data.authorAvatar;
  }
  if (data.images) {
    threadData.images = data.images;
  }

  console.log('threadData to be saved:', threadData);

  const docRef = await addDoc(collection(db, 'threads'), threadData);
  return docRef.id;
};

export const getThreadById = async (threadId: string) => {
  const docRef = doc(db, 'threads', threadId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ThreadDoc;
  }
  return null;
};

export const deleteThread = async (threadId: string, authorId: string) => {
  console.log('deleteThread - Debug:', { threadId, authorId });

  try {
    // 投稿の存在確認と権限チェック
    const threadDoc = await getThreadById(threadId);
    if (!threadDoc) {
      throw new Error('投稿が見つかりません');
    }

    if (threadDoc.authorId !== authorId) {
      throw new Error('投稿を削除する権限がありません');
    }

    // 論理削除（isDeletedフラグをtrueに設定）
    const docRef = doc(db, 'threads', threadId);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date(),
    });

    console.log('Thread deleted successfully:', threadId);
    return true;
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw error;
  }
};

export const createMaintenancePost = async (data: CreateMaintenanceData, authorId: string, authorName: string) => {
  console.log('createMaintenancePost - Debug:', { data, authorId, authorName });

  const maintenanceData: Partial<MaintenancePostDoc> = {
    title: data.title,
    content: data.content,
    carModel: data.carModel,
    mileage: data.mileage,
    cost: data.cost,
    workDate: data.workDate,
    category: data.category,
    tags: data.tags || [],
    authorId,
    authorName,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 0,
    comments: 0,
    isDeleted: false,
  };

  // オプショナルフィールドを追加
  if (data.totalTime) {
    maintenanceData.totalTime = data.totalTime;
  }
  if (data.difficulty) {
    maintenanceData.difficulty = data.difficulty;
  }
  if (data.tools) {
    maintenanceData.tools = data.tools;
  }
  if (data.parts) {
    maintenanceData.parts = data.parts;
  }
  if (data.images) {
    maintenanceData.images = data.images;
  }
  if (data.steps) {
    maintenanceData.steps = data.steps;
  }

  console.log('maintenanceData to be saved:', maintenanceData);

  const docRef = await addDoc(collection(db, 'maintenance_posts'), maintenanceData);
  return docRef.id;
};

export const deleteMaintenancePost = async (postId: string, authorId: string) => {
  console.log('deleteMaintenancePost - Debug:', { postId, authorId });

  try {
    // 投稿の存在確認と権限チェック
    const docRef = doc(db, 'maintenance_posts', postId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('投稿が見つかりません');
    }

    const postData = docSnap.data() as MaintenancePostDoc;
    if (postData.authorId !== authorId) {
      throw new Error('投稿を削除する権限がありません');
    }

    // 論理削除（isDeletedフラグをtrueに設定）
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date(),
    });

    console.log('Maintenance post deleted successfully:', postId);
    return true;
  } catch (error) {
    console.error('Error deleting maintenance post:', error);
    throw error;
  }
};

export const deleteQuestion = async (questionId: string, authorId: string) => {
  console.log('deleteQuestion - Debug:', { questionId, authorId });

  try {
    // 質問の存在確認と権限チェック
    const questionDoc = await getThreadById(questionId);
    if (!questionDoc) {
      throw new Error('質問が見つかりません');
    }

    if (questionDoc.type !== 'question') {
      throw new Error('指定された投稿は質問ではありません');
    }

    if (questionDoc.authorId !== authorId) {
      throw new Error('質問を削除する権限がありません');
    }

    // 論理削除（isDeletedフラグをtrueに設定）
    const docRef = doc(db, 'threads', questionId);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date(),
    });

    console.log('Question deleted successfully:', questionId);
    return true;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
