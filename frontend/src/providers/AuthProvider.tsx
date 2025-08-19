import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/clients';
import { UserDoc } from '../types/user';

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
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as any;
            setUserDoc({
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
            });
          } else {
                    // 新規ユーザーの場合、デフォルトデータを作成
        const defaultUserDoc: UserDoc = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          cars: [],
          interestedCars: [],
          blockedUsers: [],
          mutedWords: [],
        };
            await setDoc(userDocRef, defaultUserDoc);
            setUserDoc(defaultUserDoc);
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      } else {
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
        photoURL: user.photoURL || undefined,
        role: 'user',
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
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: new Date(),
      });
      
      // ローカル状態も更新
      setUserDoc(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
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
