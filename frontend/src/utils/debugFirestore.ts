import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/init';

// Firestoreのデータ状況を確認するためのデバッグ関数
export const debugFirestoreData = async () => {
  console.log('🔍 Firestore Debug - データ状況を確認中...');
  
  try {
    // users コレクションを確認
    console.log('👥 Users コレクションを確認中...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`📊 Users コレクション: ${usersSnapshot.size} 件のドキュメント`);
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`👤 User ID: ${doc.id}`);
      console.log(`   - displayName: ${data.displayName || 'なし'}`);
      console.log(`   - email: ${data.email || 'なし'}`);
      console.log(`   - createdAt: ${data.createdAt?.toDate?.() || data.createdAt || 'なし'}`);
    });
    
    // threads コレクションを確認
    console.log('\n💬 Threads コレクションを確認中...');
    const threadsSnapshot = await getDocs(collection(db, 'threads'));
    
    console.log(`📊 Threads コレクション: ${threadsSnapshot.size} 件のドキュメント`);
    
    threadsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📝 Thread ID: ${doc.id}`);
      console.log(`   - title: ${data.title || 'なし'}`);
      console.log(`   - authorId: ${data.authorId || 'なし'}`);
      console.log(`   - authorName: ${data.authorName || 'なし'}`);
      console.log(`   - createdAt: ${data.createdAt?.toDate?.() || data.createdAt || 'なし'}`);
    });
    
    // follows コレクションを確認
    console.log('\n👥 Follows コレクションを確認中...');
    const followsSnapshot = await getDocs(collection(db, 'follows'));
    
    console.log(`📊 Follows コレクション: ${followsSnapshot.size} 件のドキュメント`);
    
    followsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`🤝 Follow ID: ${doc.id}`);
      console.log(`   - followerId: ${data.followerId || 'なし'}`);
      console.log(`   - followingId: ${data.followingId || 'なし'}`);
      console.log(`   - createdAt: ${data.createdAt?.toDate?.() || data.createdAt || 'なし'}`);
    });
    
    console.log('\n✅ Firestore Debug 完了');
    
  } catch (error) {
    console.error('❌ Firestore Debug エラー:', error);
  }
};

// 特定のユーザーIDの存在確認
export const checkUserExists = async (userId: string) => {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    console.log(`🔍 ユーザーID ${userId} の確認:`);
    console.log(`   - 存在: ${userDoc.exists() ? 'あり' : 'なし'}`);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log(`   - displayName: ${data.displayName || 'なし'}`);
      console.log(`   - email: ${data.email || 'なし'}`);
    }
    
    return userDoc.exists();
  } catch (error) {
    console.error(`❌ ユーザー確認エラー (${userId}):`, error);
    return false;
  }
};
