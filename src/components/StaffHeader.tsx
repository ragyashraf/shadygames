'use client';

import { useLang } from '@/components/LangProvider';

export function StaffHeader() {
  const { t } = useLang();
  return (
    <header>
      <p className="kicker">{t.staffKicker}</p>
      <h1>{t.staffTitle}</h1>
      <p className="lede left">{t.staffBody}</p>
    </header>
  );
}
