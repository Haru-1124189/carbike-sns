import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/clients';
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
              isAdmin: userDoc.isAdmin
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
              username: undefined, // 新規ユーザーはusername未設定
              photoURL: user.photoURL || null,
              bio: '', // 空の自己紹介文
              role: 'user',
              isAdmin: false, // デフォルトはfalse
              createdAt: new Date(),
              updatedAt: new Date(),
              cars: [],
              interestedCars: [],
              blockedUsers: [],
              mutedWords: [],
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
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
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
