import React, { MouseEvent, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  src,
  alt
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  const handleClose = async (e?: MouseEvent) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    e?.stopPropagation();
    e?.preventDefault?.();
    setTimeout(() => {
      onClose();
      // クリック透過をさらに防ぐために少し後でフラグ解除
      setTimeout(() => { isClosingRef.current = false; }, 100);
    }, 50);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // スクロールを無効化
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center"
      onClick={handleClose}
      onMouseDown={(e) => e.stopPropagation()}
      // 100dvhでモバイルのアドレスバー影響を受けない全画面
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh' as any }}
    >
      <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
        <button
          onClick={handleClose}
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
          className="absolute -top-2 -right-2 text-white text-2xl font-bold bg-black bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-90 z-10"
        >
          ×
        </button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '100dvh', maxWidth: '100vw' }}
        />
      </div>
    </div>
  );

  // 親コンテナのスタッキングコンテキストの影響を避けるためにポータルでbody直下に描画
  return createPortal(modal, document.body);
};
