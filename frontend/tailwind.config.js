/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // メインカラー - 車・バイクらしい力強いオレンジレッドグラデーション
        primary: {
          DEFAULT: '#F97316', // オレンジ500
          light: '#FB923C',
          dark: '#EA580C',
          gradient: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
        },
        // 背景色 - より深みのあるダークテーマ
        background: {
          DEFAULT: '#0F172A', // スレート900
          light: '#1E293B',   // スレート800
          dark: '#020617',    // スレート950
        },
        // サーフェス色 - より洗練されたグレー
        surface: {
          DEFAULT: '#334155', // スレート700
          light: '#475569',   // スレート600
          dark: '#1E293B',    // スレート800
        },
        // アクセントカラー - 車・バイクらしい色合い
        accent: {
          orange: '#F97316',  // オレンジ500
          red: '#DC2626',     // レッド600
          yellow: '#F59E0B',  // アンバー500
          green: '#10B981',   // エメラルド500
          blue: '#3B82F6',    // ブルー500
          purple: '#8B5CF6',  // バイオレット500
        },
        // テキスト色
        text: {
          primary: '#F8FAFC',   // スレート50
          secondary: '#CBD5E1', // スレート300
          muted: '#64748B',     // スレート500
        }
      },
      spacing: {
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      borderRadius: {
        '2xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
        'gradient-surface': 'linear-gradient(135deg, #334155 0%, #475569 100%)',
      },
      animation: {
        'fadeInUp': 'fadeInUp 1s ease-out',
        'fadeIn': 'fadeIn 1.5s ease-out',
        'slideInLeft': 'slideInLeft 1.2s ease-out',
        'slideInRight': 'slideInRight 1.2s ease-out',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        slideInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-50px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(50px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      }
    },
  },
  plugins: [],
}
