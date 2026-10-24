import { useEffect, useState } from 'react';
import { FONT_SIZE_EVENT, FONT_SIZE_KEY, readFontSize, saveFontSize, type FontSize } from '@/lib/font-size';

export function useFontSize() {
  const [size, setSize] = useState<FontSize>('medium');
  useEffect(() => {
    const sync = () => {
      const next = readFontSize();
      setSize(next);
      document.documentElement.dataset['fontSize'] = next;
    };
    const storage = (event: StorageEvent) => { if (!event.key || event.key === FONT_SIZE_KEY) sync(); };
    sync();
    window.addEventListener(FONT_SIZE_EVENT, sync);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener(FONT_SIZE_EVENT, sync); window.removeEventListener('storage', storage); };
  }, []);
  return { size, select: (next: FontSize) => { setSize(next); saveFontSize(next); } };
}