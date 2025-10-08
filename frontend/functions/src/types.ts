export interface NewsItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  published: string;
  source: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

export interface RSSFeedConfig {
  url: string;
  source: string;
}

export interface RSSItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  description?: string;
  pubDate?: string;
  published?: string;
  isoDate?: string;
  enclosure?: {
    url: string;
    type?: string;
    length?: number;
  };
  media?: {
    content?: Array<{
      url: string;
      type: string;
      width?: number;
      height?: number;
    }>;
    thumbnail?: Array<{
      url: string;
      width?: number;
      height?: number;
    }>;
  };
  [key: string]: any; // RSSフィードの追加プロパティに対応
}
