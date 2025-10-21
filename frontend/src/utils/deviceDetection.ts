// デバイス検出ユーティリティ

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  userAgent: string;
  platform: string;
}

/**
 * デバイス情報を取得
 */
export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  // モバイルデバイスの検出
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // タブレットの検出
  const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent) || 
                   (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(platform)) ? true : false;
  
  // デスクトップの検出
  const isDesktop = !isMobile && !isTablet;
  
  // タッチデバイスの検出
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    userAgent,
    platform
  };
};

/**
 * モバイルデバイスかどうかを判定
 */
export const isMobileDevice = (): boolean => {
  return getDeviceInfo().isMobile;
};

/**
 * タブレットデバイスかどうかを判定
 */
export const isTabletDevice = (): boolean => {
  return getDeviceInfo().isTablet;
};

/**
 * デスクトップデバイスかどうかを判定
 */
export const isDesktopDevice = (): boolean => {
  return getDeviceInfo().isDesktop;
};

/**
 * タッチデバイスかどうかを判定
 */
export const isTouchDevice = (): boolean => {
  return getDeviceInfo().isTouchDevice;
};

/**
 * ユーザーエージェントからOSを判定
 */
export const getOperatingSystem = (): string => {
  const userAgent = navigator.userAgent;
  
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
  
  return 'Unknown';
};

/**
 * ブラウザを判定
 */
export const getBrowser = (): string => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
};

/**
 * 画面サイズに基づくデバイスタイプの判定
 */
export const getDeviceTypeByScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * デバイスに応じた動画アップロード方式を決定
 */
export const getVideoUploadMode = (): 'mobile' | 'desktop' => {
  const deviceInfo = getDeviceInfo();
  
  // モバイルまたはタブレットの場合はモバイルモード
  if (deviceInfo.isMobile || deviceInfo.isTablet) {
    return 'mobile';
  }
  
  return 'desktop';
};

/**
 * デバイスに応じたファイルサイズ制限を取得
 */
export const getMaxFileSizeForDevice = (): number => {
  const deviceInfo = getDeviceInfo();
  
  if (deviceInfo.isMobile) {
    return 100; // モバイル: 100MB
  } else if (deviceInfo.isTablet) {
    return 250; // タブレット: 250MB
  } else {
    return 500; // デスクトップ: 500MB
  }
};

/**
 * デバイスに応じた動画品質設定を取得
 */
export const getVideoQualityForDevice = (): {
  maxWidth: number;
  maxHeight: number;
  quality: number;
} => {
  const deviceInfo = getDeviceInfo();
  
  if (deviceInfo.isMobile) {
    return {
      maxWidth: 720,
      maxHeight: 480,
      quality: 0.7
    };
  } else if (deviceInfo.isTablet) {
    return {
      maxWidth: 1280,
      maxHeight: 720,
      quality: 0.8
    };
  } else {
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.9
    };
  }
};
