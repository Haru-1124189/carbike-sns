import { ArrowLeft, Check, Moon, Palette, Sun } from 'lucide-react';
import React from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

interface ThemeSettingsPageProps {
  onBackClick: () => void;
}

export const ThemeSettingsPage: React.FC<ThemeSettingsPageProps> = ({
  onBackClick
}) => {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; name: string; description: string; icon: React.ReactNode; preview: string }[] = [
    {
      id: 'blue',
      name: '紺色',
      description: 'デフォルトの紺色テーマ',
      icon: <Palette size={24} className="text-blue-500" />,
      preview: 'bg-gradient-to-br from-slate-900 to-slate-800'
    },
    {
      id: 'dark',
      name: 'ダーク',
      description: '真っ黒なダークテーマ',
      icon: <Moon size={24} className="text-gray-400" />,
      preview: 'bg-gradient-to-br from-black to-gray-900'
    },
    {
      id: 'light',
      name: 'ライト',
      description: '明るいライトテーマ',
      icon: <Sun size={24} className="text-yellow-500" />,
      preview: 'bg-gradient-to-br from-white to-gray-200 border border-gray-300'
    }
  ];

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        onNotificationClick={() => {}}
        onProfileClick={() => {}}
      />

      <main className="px-4 pb-24 pt-0">
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">テーマ設定</h1>
        </div>

        {/* 説明 */}
        <div className="mb-6">
          <p className="text-sm text-text-secondary">
            お好みのテーマを選択してください。選択したテーマは自動的に保存されます。
          </p>
        </div>

        {/* テーマ選択 */}
        <div className="space-y-4">
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                theme === themeOption.id
                  ? 'border-primary bg-surface-light'
                  : 'border-surface-light bg-surface hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* テーマプレビュー */}
                <div className={`w-16 h-16 rounded-lg ${themeOption.preview} flex items-center justify-center`}>
                  {themeOption.icon}
                </div>
                
                {/* テーマ情報 */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {themeOption.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {themeOption.description}
                  </p>
                </div>
                
                {/* 選択状態 */}
                {theme === themeOption.id && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 注意事項 */}
        <div className="mt-8 p-4 bg-surface-light rounded-xl">
          <h3 className="text-sm font-medium text-text-primary mb-2">注意事項</h3>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• テーマの変更は即座に反映されます</li>
            <li>• 選択したテーマは次回起動時も保持されます</li>
            <li>• 一部のコンテンツはテーマによって見え方が異なる場合があります</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
