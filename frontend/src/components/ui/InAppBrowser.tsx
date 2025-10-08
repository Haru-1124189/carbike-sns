import { X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface InAppBrowserProps {
  url: string;
  onClose: () => void;
  title?: string;
}

export const InAppBrowser: React.FC<InAppBrowserProps> = ({ url, onClose, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // iframeが読み込まれたときの処理
    const handleLoad = () => {
      console.log('In-app browser loaded:', url);
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleLoad);
      return () => {
        if (iframeRef.current) {
          iframeRef.current.removeEventListener('load', handleLoad);
        }
      };
    }
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title || 'ニュース記事'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        {/* iframe */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full border-0"
            title={title || 'ニュース記事'}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};
