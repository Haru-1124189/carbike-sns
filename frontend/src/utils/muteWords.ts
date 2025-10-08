/**
 * ミュートワード機能のユーティリティ関数
 */

/**
 * テキストにミュートワードが含まれているかチェック
 * @param text チェックするテキスト
 * @param mutedWords ミュートワードの配列
 * @returns ミュートワードが含まれているかどうか
 */
export const containsMutedWord = (text: string, mutedWords: string[]): boolean => {
  if (!text || !mutedWords || mutedWords.length === 0) {
    return false;
  }

  const lowerText = text.toLowerCase();
  
  return mutedWords.some(word => {
    if (!word || word.trim() === '') return false;
    const lowerWord = word.toLowerCase().trim();
    return lowerText.includes(lowerWord);
  });
};

/**
 * 投稿データにミュートワードが含まれているかチェック
 * @param post 投稿データ（title, description, content等のテキストフィールドを持つオブジェクト）
 * @param mutedWords ミュートワードの配列
 * @returns ミュートワードが含まれているかどうか
 */
export const shouldMutePost = (post: any, mutedWords: string[]): boolean => {
  if (!post || !mutedWords || mutedWords.length === 0) {
    return false;
  }

  // チェックするフィールドのリスト
  const textFields = [
    'title',
    'description', 
    'content',
    'question',
    'answer',
    'comment',
    'reply'
  ];

  // 各テキストフィールドをチェック
  for (const field of textFields) {
    if (post[field] && typeof post[field] === 'string') {
      if (containsMutedWord(post[field], mutedWords)) {
        return true;
      }
    }
  }

  // タグもチェック
  if (post.tags && Array.isArray(post.tags)) {
    const tagText = post.tags.join(' ');
    if (containsMutedWord(tagText, mutedWords)) {
      return true;
    }
  }

  return false;
};

/**
 * 投稿リストからミュートワードを含む投稿をフィルタリング
 * @param posts 投稿の配列
 * @param mutedWords ミュートワードの配列
 * @returns フィルタリングされた投稿の配列
 */
export const filterMutedPosts = <T>(posts: T[], mutedWords: string[]): T[] => {
  if (!posts || !mutedWords || mutedWords.length === 0) {
    return posts;
  }

  return posts.filter(post => !shouldMutePost(post, mutedWords));
};

/**
 * ミュートワードの文字列を安全にエスケープ（将来的な拡張用）
 * @param word エスケープする単語
 * @returns エスケープされた単語
 */
export const escapeMuteWord = (word: string): string => {
  // 基本的な正規表現エスケープ
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * ミュートワードの検証
 * @param word 検証する単語
 * @returns 有効かどうかとエラーメッセージ
 */
export const validateMuteWord = (word: string): { isValid: boolean; error?: string } => {
  if (!word || word.trim() === '') {
    return { isValid: false, error: 'キーワードを入力してください' };
  }

  if (word.trim().length < 2) {
    return { isValid: false, error: 'キーワードは2文字以上で入力してください' };
  }

  if (word.trim().length > 50) {
    return { isValid: false, error: 'キーワードは50文字以下で入力してください' };
  }

  // 特殊文字のチェック（必要に応じて）
  const hasSpecialChars = /[<>\"'&]/.test(word);
  if (hasSpecialChars) {
    return { isValid: false, error: 'キーワードに使用できない文字が含まれています' };
  }

  return { isValid: true };
};
