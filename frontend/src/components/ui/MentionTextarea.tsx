import React, { useRef, useState } from 'react';
import { UserDoc } from '../../types/user';
import { MentionSearch } from './MentionSearch';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const MentionTextarea: React.FC<MentionTextareaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  maxLength,
  rows = 3,
  disabled = false,
  style
}) => {
  const [showMentionSearch, setShowMentionSearch] = useState(false);
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // メンション検索のトリガーを検出
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // @で始まる文字列を検出
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const searchTerm = mentionMatch[1];
      setMentionSearchTerm(searchTerm);
      setShowMentionSearch(true);
      
      // カーソル位置を計算
      const rect = e.target.getBoundingClientRect();
      const lineHeight = parseInt(getComputedStyle(e.target).lineHeight);
      const lines = textBeforeCursor.split('\n').length;
      
      setMentionPosition({
        x: rect.left + (cursorPosition % 50) * 8, // 概算
        y: rect.top + (lines - 1) * lineHeight
      });
    } else {
      setShowMentionSearch(false);
    }
  };

  // メンション選択時の処理
  const handleMentionSelect = (user: UserDoc) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    // @で始まる部分を置換
    const beforeMention = textBeforeCursor.replace(/@\w*$/, '');
    const newValue = beforeMention + `@${user.username} ` + textAfterCursor;
    
    onChange(newValue);
    setShowMentionSearch(false);

    // カーソル位置を調整
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = beforeMention.length + user.username!.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // メンション検索を閉じる
  const handleCloseMentionSearch = () => {
    setShowMentionSearch(false);
  };

  // キーボードイベントの処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionSearch && (e.key === 'Escape' || e.key === 'Tab')) {
      e.preventDefault();
      setShowMentionSearch(false);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        style={style}
      />
      
      {/* メンション検索 */}
      <MentionSearch
        isOpen={showMentionSearch}
        onClose={handleCloseMentionSearch}
        onSelectUser={handleMentionSelect}
        searchTerm={mentionSearchTerm}
        position={mentionPosition}
      />
    </div>
  );
};
