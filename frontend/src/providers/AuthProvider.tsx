import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/init';
import { UserDoc } from '../types/user';
import { UserDataBackup } from '../utils/userDataBackup';

interface AuthContextType {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserDoc: (updates: Partial<UserDoc>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Starting auth state listener');
    
    // 古いバックアップをクリーンアップ
    UserDataBackup.cleanupOldBackups();
    
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log('AuthProvider: Auth state changed', { 
        user: user?.uid, 
        email: user?.email 
      });
      
      setUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as any;
            const userDoc = {
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
              isAdmin: data.isAdmin || false, // isAdminフィールドを明示的に含める
            };
            console.log('AuthProvider: Found existing user doc', { 
              displayName: userDoc.displayName,
              role: userDoc.role,
              isAdmin: userDoc.isAdmin,
              firebaseAuthDisplayName: user.displayName
            });
            setUserDoc(userDoc);
            
            // ユーザーデータをバックアップ
            await UserDataBackup.backupUserData(user.uid);
          } else {
            // バックアップから復元を試行
            const restored = await UserDataBackup.restoreUserData(user.uid);
            
            if (restored) {
              // 復元成功時は再度データを取得
              const restoredDocSnap = await getDoc(userDocRef);
              if (restoredDocSnap.exists()) {
                const data = restoredDocSnap.data() as any;
                const userDoc = {
                  ...data,
                  createdAt: data.createdAt?.toDate?.() || new Date(),
                  updatedAt: data.updatedAt?.toDate?.() || new Date(),
                  isAdmin: data.isAdmin || false,
                };
                console.log('AuthProvider: Restored user doc from backup', { 
                  displayName: userDoc.displayName 
                });
                setUserDoc(userDoc);
                return;
              }
            }
            
            // 新規ユーザーの場合、デフォルトデータを作成
            const defaultUserDoc: UserDoc = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              username: undefined,
              photoURL: user.photoURL || null,
              bio: '',
              role: 'user',
              isAdmin: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              cars: [],
              interestedCars: [],
              blockedUsers: [],
              mutedWords: []
            };
            console.log('AuthProvider: Creating new user doc', { 
              displayName: defaultUserDoc.displayName 
            });
            await setDoc(userDocRef, defaultUserDoc);
            setUserDoc(defaultUserDoc);
            
            // 新規ユーザーデータもバックアップ
            await UserDataBackup.backupUserData(user.uid);
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      } else {
        console.log('AuthProvider: No user, setting userDoc to null');
        setUserDoc(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // 初回ログインフラグを設定（PWAインストールプロンプト用）
      const hasLoggedInBefore = localStorage.getItem('has-logged-in-before');
      if (!hasLoggedInBefore) {
        localStorage.setItem('is-first-login', 'true');
        localStorage.setItem('has-logged-in-before', 'true');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Firebase AuthのdisplayNameを更新
      console.log('Setting Firebase Auth displayName:', displayName);
      await updateProfile(user, {
        displayName: displayName
      });
      console.log('Firebase Auth displayName set successfully');
      
      // ユーザードキュメントを作成
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc: UserDoc = {
        uid: user.uid,
        email: user.email || '',
        displayName,
        username: undefined, // 新規ユーザーはusername未設定
        photoURL: user.photoURL || null,
        role: 'user',
        isAdmin: false, // デフォルトはfalse
        createdAt: new Date(),
        updatedAt: new Date(),
        cars: [],
        interestedCars: [],
        blockedUsers: [],
        mutedWords: [],
      };
      await setDoc(userDocRef, userDoc);
      console.log('User document created successfully with displayName:', displayName);
      
      // 新規登録時は初回ログインフラグを設定
      localStorage.setItem('is-first-login', 'true');
      localStorage.setItem('has-logged-in-before', 'true');
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUserDoc = async (updates: Partial<UserDoc>) => {
    if (!user) {
      console.error('updateUserDoc: No user found');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // プロフィール画像の場合はFirebase Authも更新（URLが短い場合のみ）
      if (updates.photoURL !== undefined) {
        const photoUrl = updates.photoURL;
        
        // Firebase AuthのphotoURLはURLの長さ制限があるため、短い場合のみ更新
        // 長いURL（100文字以上）の場合はFirestoreのみに保存
        if (photoUrl && photoUrl.length < 100) {
          try {
            console.log('Updating Firebase Auth photoURL:', photoUrl);
            await updateProfile(user, {
              photoURL: photoUrl
            });
            console.log('Firebase Auth photoURL updated successfully');
          } catch (profileError: any) {
            console.warn('Firebase Auth photoURL update failed:', profileError);
            // Firebase Auth更新失敗は無視（Firestoreのみに保存）
          }
        } else if (!photoUrl || photoUrl.length === 0) {
          // 空文字列の場合は削除として扱う
          try {
            await updateProfile(user, {
              photoURL: null
            });
          } catch (profileError: any) {
            console.warn('Firebase Auth photoURL deletion failed:', profileError);
          }
        } else {
          console.log('PhotoURL too long, skipping Firebase Auth update (length:', photoUrl.length, ')');
        }
      }
      
      // displayNameの場合はFirebase Authも更新
      if (updates.displayName !== undefined) {
        try {
          console.log('Updating Firebase Auth displayName:', updates.displayName);
          await updateProfile(user, {
            displayName: updates.displayName
          });
          console.log('Firebase Auth displayName updated successfully');
        } catch (profileError: any) {
          console.warn('Firebase Auth displayName update failed:', profileError);
          // Firebase Auth更新失敗は無視（Firestoreのみに保存）
        }
      }
      
      // Firestoreを更新
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: new Date(),
      });
      
      // ローカル状態も更新
      setUserDoc(prev => {
        if (!prev) {
          console.error('updateUserDoc: No userDoc found');
          return null;
        }
        return { ...prev, ...updates, updatedAt: new Date() };
      });
      
      console.log('User document updated successfully:', updates);
    } catch (error) {
      console.error('Update user doc error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userDoc,
    loading,
    login,
    register,
    logout,
    updateUserDoc,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
