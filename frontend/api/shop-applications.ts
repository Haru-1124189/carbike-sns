import { getApps, initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getDocs, getFirestore, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase初期化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

interface ShopApplication {
  userId: string;
  displayName: string;
  email: string;
  shopName: string;
  businessType: string;
  description: string;
  website?: string;
  socialMedia?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // 申請の提出
      const { userId, displayName, email, shopName, businessType, description, website, socialMedia } = req.body;

      if (!userId || !displayName || !email || !shopName || !businessType || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const applicationData: ShopApplication = {
        userId,
        displayName,
        email,
        shopName,
        businessType,
        description,
        website,
        socialMedia,
        status: 'pending',
        submittedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'shopApplications'), applicationData);

      return res.status(200).json({
        success: true,
        applicationId: docRef.id
      });

    } else if (req.method === 'GET') {
      // 申請一覧の取得
      const { status } = req.query;

      let q = query(
        collection(db, 'shopApplications'),
        orderBy('submittedAt', 'desc')
      );

      if (status && status !== 'all') {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return res.status(200).json({
        success: true,
        applications
      });

    } else if (req.method === 'PUT') {
      // 申請の審査
      const { applicationId, status, reviewNotes, reviewedBy } = req.body;

      if (!applicationId || !status || !reviewedBy) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const applicationRef = doc(db, 'shopApplications', applicationId);
      await updateDoc(applicationRef, {
        status,
        reviewNotes,
        reviewedBy,
        reviewedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Application reviewed successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in shop-applications:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
