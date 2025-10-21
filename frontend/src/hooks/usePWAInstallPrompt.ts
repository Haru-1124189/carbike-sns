import { useEffect, useState } from 'react';

export const usePWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 初回ログインかどうかをチェック
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
    const isFirstLogin = localStorage.getItem('is-first-login') === 'true';
    
    // 初回ログインで、まだプロンプトを見ていない場合のみ表示
    if (isFirstLogin && !hasSeenPrompt) {
      // 少し遅延させて表示（ログイン完了後に）
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // PWAインストールイベントのリスナー
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    // プロンプトを見たことを記録
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install outcome: ${outcome}`);
      setDeferredPrompt(null);
    }
    handleClose();
  };

  return {
    showPrompt,
    handleClose,
    handleInstall,
    canInstall: !!deferredPrompt
  };
};
