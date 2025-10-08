export interface NewsItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  published: string;
  source: string;
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
}
