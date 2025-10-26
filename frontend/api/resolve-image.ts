import { doc, getDoc } from 'firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../firebase/init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shortId } = req.query;

  if (!shortId || typeof shortId !== 'string') {
    return res.status(400).json({ error: 'Short ID is required' });
  }

  try {
    // Firestoreから短縮URLマッピングを取得
    const shortUrlRef = doc(db, 'short-urls', shortId);
    const shortUrlSnap = await getDoc(shortUrlRef);

    if (!shortUrlSnap.exists()) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const shortUrlData = shortUrlSnap.data();
    const originalUrl = shortUrlData.originalUrl;

    if (!originalUrl) {
      return res.status(404).json({ error: 'Original URL not found' });
    }

    // 元の画像URLにリダイレクト
    res.redirect(302, originalUrl);
  } catch (error) {
    console.error('Error resolving short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
