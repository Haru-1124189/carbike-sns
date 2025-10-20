import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase/init';
import { UserDoc } from '../types/user';

// メンション用のユーザー検索
export const searchUsersByUsername = async (searchTerm: string): Promise<UserDoc[]> => {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '>=', searchTerm),
      where('username', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const users: UserDoc[] = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        ...userData
      } as UserDoc);
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// テキストからメンションを抽出
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return Array.from(new Set(mentions)); // 重複を除去
};

// メンションをリンクに変換
export const convertMentionsToLinks = (text: string, onMentionClick?: (username: string) => void): string => {
  return text.replace(/@(\w+)/g, (match, username) => {
    if (onMentionClick) {
      return `<span class="mention-link" data-username="${username}" style="color: #3b82f6; cursor: pointer;">${match}</span>`;
    }
    return `<span class="mention" style="color: #3b82f6;">${match}</span>`;
  });
};

// ユーザー名のバリデーション
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'ユーザー名を入力してください' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'ユーザー名は3文字以上で入力してください' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'ユーザー名は20文字以下で入力してください' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'ユーザー名は英数字とアンダースコアのみ使用できます' };
  }

  // 予約語チェック
  const reservedWords = ['admin', 'administrator', 'mod', 'moderator', 'system', 'support', 'help'];
  if (reservedWords.includes(username.toLowerCase())) {
    return { isValid: false, error: 'このユーザー名は使用できません' };
  }

  return { isValid: true };
};

// ユーザー名の重複チェック
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};
