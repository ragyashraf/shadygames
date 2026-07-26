'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/components/LangProvider';

type Msg = { role: 'assistant' | 'user'; text: string };

type StoreSnapshot = {
  products: { name: string; price_usd: number; live: boolean }[];
  codes: { code: string; percent: number; active: boolean }[];
  keysAvailable: number;
  keysTotal: number;
  recentTx: number;
};

export function StaffChat({ store }: { store: StoreSnapshot }) {
  const { t, ar } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const greeting = t.aiGreeting;
  const thread = messages ?? [{ role: 'assistant' as const, text: greeting }];

  useEffect(() => {
    setMessages(null);
  }, [greeting]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [thread, loading, open]);

  const context = useMemo(() => {
    const productLine = store.products
      .map((p) => `${p.name} $${p.price_usd}${p.live ? '' : ' (hidden)'}`)
      .join('; ');
    const codeLine = store.codes
      .filter((c) => c.active)
      .map((c) => `${c.code} ${c.percent}%`)
      .join(', ');
    return `Products: ${productLine || 'none'}. Active codes: ${codeLine || 'none'}. Keys available: ${store.keysAvailable}/${store.keysTotal}. Recent transactions listed: ${store.recentTx}.`;
  }, [store]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;

    const next: Msg[] = [...thread, { role: 'user', text: q }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/staff/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: q,
          context,
          history: next.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Chat failed');
      setMessages(next.concat([{ role: 'assistant', text: body.reply as string }]));
    } catch {
      setMessages(next.concat([{ role: 'assistant', text: t.aiError }]));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="ai-launch" onClick={() => setOpen(true)}>
        <span className="ai-launch-dot" />
        {t.aiSupport}
      </button>

      {open ? (
        <aside className="ai-panel" dir={ar ? 'rtl' : 'ltr'}>
          <header className="ai-panel-head">
            <div className="ai-panel-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shady-logo.webp" alt="" width={32} height={32} />
              <div>
                <div className="ai-title">{t.aiTitle}</div>
                <div className="ai-sub">{t.aiSub}</div>
              </div>
            </div>
            <button type="button" className="ai-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </header>

          <div className="ai-messages" ref={scroller}>
            {thread.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`ai-row ${m.role === 'user' ? 'user' : 'bot'}`}
              >
                <div className="ai-bubble">{m.text}</div>
              </div>
            ))}
            {loading ? (
              <div className="ai-thinking">
                <span className="ai-spin" />
                {t.aiThinking}
              </div>
            ) : null}
          </div>

          <footer className="ai-panel-foot">
            <div className="ai-suggestions">
              {t.aiSuggestions.map((label) => (
                <button key={label} type="button" onClick={() => ask(label)} disabled={loading}>
                  {label}
                </button>
              ))}
            </div>
            <div className="ai-compose">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') ask(input);
                }}
                placeholder={t.aiPlaceholder}
                disabled={loading}
              />
              <button type="button" className="gold-btn" onClick={() => ask(input)} disabled={loading}>
                {t.aiSend}
              </button>
            </div>
          </footer>
        </aside>
      ) : null}
    </>
  );
}
