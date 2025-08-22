import { useMemo, useState } from 'react';

export const useSearch = <T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[]
) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return items.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (Array.isArray(value)) {
          return value.some((v: any) => 
            typeof v === 'string' && v.toLowerCase().includes(query)
          );
        }
        return false;
      });
    });
  }, [items, searchQuery, searchFields]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    clearSearch,
    isSearching: searchQuery.trim().length > 0
  };
};
