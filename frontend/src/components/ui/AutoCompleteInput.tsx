import React, { useMemo, useState } from 'react';

interface AutoCompleteInputProps {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  value,
  onChange,
  suggestions,
  placeholder
}) => {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(value);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 10);
    return suggestions
      .filter(s => s.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, suggestions]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
      />
      {focused && list.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-surface-light rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {list.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(s); setQuery(s); setFocused(false); }}
              className="w-full text-left px-3 py-2 hover:bg-surface-light text-sm text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


