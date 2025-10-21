import React, { ComponentType, lazy } from 'react';

// ページレベルの遅延読み込み
export const LazyHomePage = lazy(() => import('../pages/HomePage').then(module => ({ default: module.HomePage })));
export const LazyMarketplacePage = lazy(() => import('../pages/MarketplaceHomePage').then(module => ({ default: module.MarketplaceHomePage })));
export const LazyProfilePage = lazy(() => import('../pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
export const LazyVideosPage = lazy(() => import('../pages/VideosPage').then(module => ({ default: module.VideosPage })));
export const LazyMaintenancePage = lazy(() => import('../pages/MaintenancePage').then(module => ({ default: module.MaintenancePage })));
export const LazyThreadDetailPage = lazy(() => import('../pages/ThreadDetailPage').then(module => ({ default: module.ThreadDetailPage })));
export const LazyMaintenanceDetailPage = lazy(() => import('../pages/MaintenanceDetailPage').then(module => ({ default: module.MaintenanceDetailPage })));
export const LazyVideoDetailPage = lazy(() => import('../pages/VideoDetailPage').then(module => ({ default: module.VideoDetailPage })));
export const LazyUploadVideoPage = lazy(() => import('../pages/UploadVideoPage').then(module => ({ default: module.UploadVideoPage })));
export const LazyHelpPage = lazy(() => import('../pages/HelpPage').then(module => ({ default: module.HelpPage })));

// 条件付き遅延読み込み用のヘルパー関数
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => {
    const fallbackElement = fallback ? React.createElement(fallback) : React.createElement('div', null, '読み込み中...');
    
    return React.createElement(
      React.Suspense,
      { fallback: fallbackElement },
      React.createElement(LazyComponent, props)
    );
  };
};

// プリロード用のヘルパー関数
export const preloadComponent = (importFunc: () => Promise<any>) => {
  return () => {
    importFunc();
  };
};

// ルートベースのプリロード
export const preloadRoutes = () => {
  // 主要ページをプリロード
  setTimeout(() => {
    import('../pages/MarketplaceHomePage');
    import('../pages/ProfilePage');
    import('../pages/VideosPage');
  }, 2000);
  
  // ユーザーがホバーしたときにプリロード
  setTimeout(() => {
    import('../pages/UploadVideoPage');
    import('../pages/HelpPage');
  }, 5000);
};
