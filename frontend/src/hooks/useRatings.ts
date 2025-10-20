import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    where
} from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase/init';
import { MarketplaceRating } from '../types/marketplace';

// 評価機能のフック
export const useRatings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 評価を作成
  const createRating = async (
    itemId: string,
    orderId: string,
    raterId: string,
    rateeId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    comment: string,
    type: 'seller' | 'buyer'
  ) => {
    try {
      setLoading(true);
      console.log('⭐ 評価作成開始:', {
        itemId,
        orderId,
        raterId,
        rateeId,
        rating,
        comment: comment.substring(0, 50) + '...',
        type,
        timestamp: new Date().toISOString()
      });

      const ratingData: Omit<MarketplaceRating, 'id'> = {
        itemId,
        orderId,
        raterId,
        rateeId,
        rating,
        comment,
        type,
        createdAt: serverTimestamp() as Timestamp
      };

      const ratingRef = await addDoc(collection(db, 'ratings'), ratingData);

      // アプリ内に評価作成を通知（未評価リストからの除外に使用）
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('rating:created', {
              detail: { orderId, raterId }
            })
          );
        }
      } catch (_) {}

      console.log('✅ 評価作成完了:', {
        ratingId: ratingRef.id,
        itemId,
        orderId,
        rating,
        type,
        timestamp: new Date().toISOString()
      });

      return ratingRef.id;
    } catch (error) {
      console.error('❌ 評価作成エラー:', error);
      setError('評価の作成に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 商品の評価一覧を取得
  const getItemRatings = async (itemId: string) => {
    try {
      setLoading(true);
      console.log('⭐ 商品評価取得開始:', { itemId, timestamp: new Date().toISOString() });

      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('itemId', '==', itemId),
        orderBy('createdAt', 'desc')
      );

      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsData = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketplaceRating[];

      console.log('✅ 商品評価取得完了:', {
        itemId,
        count: ratingsData.length,
        ratings: ratingsData.map(r => ({
          id: r.id,
          rating: r.rating,
          type: r.type,
          comment: r.comment?.substring(0, 30) + '...'
        })),
        timestamp: new Date().toISOString()
      });

      return ratingsData;
    } catch (error) {
      console.error('❌ 商品評価取得エラー:', error);
      setError('評価の取得に失敗しました');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ユーザーの評価一覧を取得
  const getUserRatings = async (userId: string) => {
    try {
      setLoading(true);
      console.log('⭐ ユーザー評価取得開始:', { userId, timestamp: new Date().toISOString() });

      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('rateeId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsData = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketplaceRating[];

      console.log('✅ ユーザー評価取得完了:', {
        userId,
        count: ratingsData.length,
        ratings: ratingsData.map(r => ({
          id: r.id,
          rating: r.rating,
          type: r.type,
          comment: r.comment?.substring(0, 30) + '...'
        })),
        timestamp: new Date().toISOString()
      });

      return ratingsData;
    } catch (error) {
      console.error('❌ ユーザー評価取得エラー:', error);
      setError('評価の取得に失敗しました');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 注文の評価状況を確認
  const getOrderRatingStatus = async (orderId: string, userId: string) => {
    try {
      console.log('⭐ 注文評価状況確認開始:', { orderId, userId, timestamp: new Date().toISOString() });

      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('orderId', '==', orderId),
        where('raterId', '==', userId)
      );

      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsData = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketplaceRating[];

      const hasSellerRating = ratingsData.some(r => r.type === 'seller');
      const hasBuyerRating = ratingsData.some(r => r.type === 'buyer');

      console.log('✅ 注文評価状況確認完了:', {
        orderId,
        userId,
        hasSellerRating,
        hasBuyerRating,
        ratingsCount: ratingsData.length,
        timestamp: new Date().toISOString()
      });

      return {
        hasSellerRating,
        hasBuyerRating,
        ratings: ratingsData
      };
    } catch (error) {
      console.error('❌ 注文評価状況確認エラー:', error);
      setError('評価状況の確認に失敗しました');
      return {
        hasSellerRating: false,
        hasBuyerRating: false,
        ratings: []
      };
    }
  };

  // ユーザーの平均評価を計算
  const calculateUserAverageRating = async (userId: string) => {
    try {
      console.log('⭐ ユーザー平均評価計算開始:', { userId, timestamp: new Date().toISOString() });

      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('rateeId', '==', userId)
      );

      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsData = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketplaceRating[];

      if (ratingsData.length === 0) {
        console.log('✅ ユーザー平均評価計算完了（評価なし）:', {
          userId,
          averageRating: 0,
          totalRatings: 0,
          timestamp: new Date().toISOString()
        });
        return { averageRating: 0, totalRatings: 0 };
      }

      const totalRating = ratingsData.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = Math.round((totalRating / ratingsData.length) * 10) / 10;

      console.log('✅ ユーザー平均評価計算完了:', {
        userId,
        averageRating,
        totalRatings: ratingsData.length,
        timestamp: new Date().toISOString()
      });

      return {
        averageRating,
        totalRatings: ratingsData.length
      };
    } catch (error) {
      console.error('❌ ユーザー平均評価計算エラー:', error);
      setError('平均評価の計算に失敗しました');
      return { averageRating: 0, totalRatings: 0 };
    }
  };

  // 未評価リマインダー（A: アプリ内通知用に件数と対象を返す）
  // 条件: orders.status === 'completed' かつ (buyerId === userId || sellerId === userId) で、ratings に raterId === userId のレコードが無い
  const getPendingRatingReminders = async (userId: string) => {
    try {
      // buyer と seller で OR が使えないため2クエリで取得
      const buyerOrdersSnap = await getDocs(
        query(collection(db, 'orders'), where('buyerId', '==', userId), where('status', '==', 'completed'))
      );
      const sellerOrdersSnap = await getDocs(
        query(collection(db, 'orders'), where('sellerId', '==', userId), where('status', '==', 'completed'))
      );

      const orders = [...buyerOrdersSnap.docs, ...sellerOrdersSnap.docs].map((d) => ({ id: d.id, ...d.data() } as any));
      if (orders.length === 0) return { count: 0, orders: [] as any[] };

      const pending: any[] = [];
      // 各注文に対し、当人の評価が存在するか確認
      for (const order of orders) {
        const rs = await getDocs(
          query(collection(db, 'ratings'), where('orderId', '==', order.id), where('raterId', '==', userId))
        );
        if (rs.empty) {
          pending.push(order);
        }
      }

      return { count: pending.length, orders: pending };
    } catch (e) {
      console.warn('getPendingRatingReminders error:', e);
      return { count: 0, orders: [] as any[] };
    }
  };

  return {
    loading,
    error,
    createRating,
    getItemRatings,
    getUserRatings,
    getOrderRatingStatus,
    calculateUserAverageRating,
    getPendingRatingReminders
  };
};
