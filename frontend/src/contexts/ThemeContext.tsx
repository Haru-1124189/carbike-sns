import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeColors: () => ThemeColors;
}

interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  primaryDark: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeColors: Record<Theme, ThemeColors> = {
  blue: {
    background: '#0f172a', // 紺色（現在のデフォルト）
    surface: '#1e293b',
    surfaceLight: '#334155',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    border: '#334155'
  },
  dark: {
    background: '#000000', // 黒
    surface: '#1a1a1a',
    surfaceLight: '#2d2d2d',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#2d2d2d'
  },
  light: {
    background: '#ffffff', // 白
    surface: '#f1f5f9', // より濃いグレー
    surfaceLight: '#e2e8f0', // さらに濃いグレー
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    textPrimary: '#1e293b', // 濃い色に変更
    textSecondary: '#475569', // より濃いグレーに変更
    border: '#cbd5e1' // より濃いボーダー
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('blue');

  // ローカルストレージからテーマを読み込み
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['blue', 'dark', 'light'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  // テーマを変更し、ローカルストレージに保存
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // CSS変数を更新
    const colors = themeColors[newTheme];
    const root = document.documentElement;
    
    // data-theme属性を設定
    root.setAttribute('data-theme', newTheme);
    
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--surface-light', colors.surfaceLight);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--border', colors.border);
    
    // PWAのステータスバー色を更新
    updateStatusBarColor(colors.background);
  };

  // 現在のテーマの色を取得
  const getThemeColors = () => themeColors[theme];

  // PWAのステータスバー色を更新する関数
  const updateStatusBarColor = (backgroundColor: string) => {
    // manifest.jsonのtheme_colorを動的に更新
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      // 一時的にmanifestを無効化して再読み込み
      manifestLink.href = '';
      setTimeout(() => {
        manifestLink.href = '/manifest.json';
        // meta theme-colorを更新
        let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
        if (!themeColorMeta) {
          themeColorMeta = document.createElement('meta');
          themeColorMeta.name = 'theme-color';
          document.head.appendChild(themeColorMeta);
        }
        themeColorMeta.content = backgroundColor;
      }, 100);
    }
  };

  // 初期化時にCSS変数を設定
  useEffect(() => {
    const colors = themeColors[theme];
    const root = document.documentElement;
    
    // data-theme属性を設定
    root.setAttribute('data-theme', theme);
    
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--surface-light', colors.surfaceLight);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--border', colors.border);
    
    // PWAのステータスバー色を更新
    updateStatusBarColor(colors.background);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
