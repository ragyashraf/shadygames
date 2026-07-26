'use client';

import { useLang } from '@/components/LangProvider';

export function LangToggle() {
  const { ar, toggleLang } = useLang();
  return (
    <button type="button" className="lang-toggle" onClick={toggleLang} aria-label="Language">
      {ar ? 'EN' : 'العربية'}
    </button>
  );
}
