import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/init';

// 新しいニュースデータ
const newsData = [
  {
    title: "約211万円で7人乗り! トヨタ「新シエンタ」は最安グレードでも十分な装備",
    link: "https://example.com/news/toyota-sienta-2025",
    summary: "トヨタの新シエンタが2025年8月に発売予定。最安グレードでも安全装備が充実し、7人乗りとして魅力的な価格設定。",
    published: "2025年8月発売予定",
    source: "CarBike News",
    thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "ガソリン以外でも走れるスズキのバイク? 「ジクサーSF250」が話題",
    link: "https://example.com/news/suzuki-gixxer-sf250-2025",
    summary: "スズキが2025年10月30日から11月にかけて開催される東京モーターショーで、新しいバイク「ジクサーSF250」を発表予定。",
    published: "2025年10月30日から11月",
    source: "Bike News",
    thumbnailUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "474万円! 7人乗りミニバンの新王者「ホンダ・ステップワゴン」が登場",
    link: "https://example.com/news/honda-stepwgn-2025",
    summary: "ホンダの新型ステップワゴンが2025年秋に発売。最新の安全技術と快適性を備えた7人乗りミニバンとして注目。",
    published: "2025年秋発売予定",
    source: "Car News",
    thumbnailUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "パナソニック ストラーダ「CN-HE02D」が高画質・多機能で人気沸騰",
    link: "https://example.com/news/panasonic-strada-cn-he02d",
    summary: "パナソニックのカーナビ「ストラーダ CN-HE02D」が高画質ディスプレイと多機能で話題。10月7日から10日の期間限定セールも開催中。",
    published: "2025年10月7日〜10日",
    source: "Car Tech News",
    thumbnailUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "何が凄い? マツダが700万円超えの「凄いロードスター」を発表",
    link: "https://example.com/news/mazda-roadster-700man",
    summary: "マツダが新型ロードスターの特別仕様車を発表。700万円を超える価格設定ながら、特別なエクステリアとインテリアで話題。",
    published: "2025年10月14日",
    source: "Sports Car News",
    thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "新車約360万円の電気自動車「日産・リーフ」新型が登場",
    link: "https://example.com/news/nissan-leaf-2025",
    summary: "日産の新型リーフが2025年冬に発売予定。約360万円からの価格設定で、電気自動車の普及を後押し。",
    published: "2025年冬発売予定",
    source: "EV News",
    thumbnailUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center"
  }
];

// ニュースデータをFirestoreに追加する関数
export const addNewsDataToFirestore = async () => {
  try {
    console.log('ニュースデータの追加を開始...');
    
    for (const newsItem of newsData) {
      const docRef = await addDoc(collection(db, 'news'), {
        ...newsItem,
        createdAt: serverTimestamp()
      });
      console.log(`ニュース追加完了: ${newsItem.title} (ID: ${docRef.id})`);
    }
    
    console.log('すべてのニュースデータの追加が完了しました！');
    return true;
  } catch (error) {
    console.error('ニュースデータの追加中にエラーが発生:', error);
    return false;
  }
};

// 開発用：ブラウザのコンソールから実行できるようにする
if (typeof window !== 'undefined') {
  (window as any).addNewsData = addNewsDataToFirestore;
}
