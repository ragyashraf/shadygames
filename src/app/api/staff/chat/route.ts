import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

type ChatBody = {
  message?: string;
  context?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
};

const SYSTEM = `You are the internal staff assistant for Shady, a store selling GTA V roleplay server subscriptions ($10 Access / Starter, $15 Kingpin / Pro, $25 Dragon / Advanced; monthly or yearly) and one-time TikTok interactive game setups. Payments go through Paddle (merchant of record). Fulfillment is mirrored in Supabase via webhooks. Answer staff operationally and briefly (max 120 words), in the language of the question.`;

function localReply(message: string, context: string): string {
  const q = message.toLowerCase();
  const ar = /[\u0600-\u06FF]/.test(message);

  if (/key|مفتاح|لم يستلم|did not get|didn't get|missing/.test(q)) {
    return ar
      ? `تحقق: 1) نجح webhook في Paddle؟ 2) نفس البريد بين الحساب والدفع؟ 3) في Staff → Access keys هل وُجد مفتاح reserved/delivered لهذا العميل؟ 4) إن لم يوجد مفتاح available لنفس SKU أضف مخزوناً ثم أعد إرسال المفتاح يدوياً من الداشبورد/ديسكورد. الحالة الحالية: ${context}`
      : `Check: 1) Did the Paddle webhook succeed? 2) Same email on account + checkout? 3) In Staff → Access keys, is there a reserved/delivered key for that customer? 4) If no available key for the SKU, restock then resend via Discord/dashboard. Live state: ${context}`;
  }

  if (/refund|استرجاع|chargeback|cancel/.test(q)) {
    return ar
      ? `مسودة رد: «شكراً لتواصلك. حسب سياسة الاسترجاع يمكننا مراجعة طلبك خلال 48 ساعة إن لم تُستخدم المكافآت داخل اللعبة. افتح Account → Billing أو أرسل رقم إيصال Paddle وسنكمل من هناك.» للإلغاء فقط: بوابة Paddle توقف التجديد مع بقاء الوصول حتى نهاية الفترة المدفوعة.`
      : `Draft reply: “Thanks for reaching out. Per our refund policy we can review within 48 hours if in-game payouts/rewards weren’t used. Open Account → Billing or send your Paddle receipt and we’ll take it from there.” For cancel-only: Paddle portal stops renewal; access lasts until the paid period ends.`;
  }

  if (/promo|خصم|code|كود|discount/.test(q)) {
    return ar
      ? `اقتراح: أنشئ خصماً في Paddle (مثلاً SHADY10 = 10%) واربطه في جدول discount_codes، حدّد max uses وتاريخ انتهاء، وفعّله في الكاشير. لا تشارك الأكواد العامة في الديسكورد العام إن كان المخزون محدوداً.`
      : `Suggestion: create a Paddle discount (e.g. SHADY10 = 10%), mirror it in discount_codes with max uses + expiry, enable for checkout. Avoid blasting limited codes in public Discord.`;
  }

  if (/price|سعر|tier|رتب|starter|kingpin|dragon|access|pro|advanced/.test(q)) {
    return ar
      ? `الرتب: أكسس/Starter 10$ · كينغ بين/Pro 15$ · دراغون/Advanced 25$ شهرياً (سنوي بخصم ~25%). الأسعار تظهر محلية عبر Paddle PricePreview. الدفع Overlay one-page ثم /welcome.`
      : `Ranks: Access/Starter $10 · Kingpin/Pro $15 · Dragon/Advanced $25 monthly (yearly ~25% off). Localized totals via Paddle PricePreview. Checkout is overlay one-page → /welcome.`;
  }

  return ar
    ? `أنا مساعد طاقم شادي. اسأل عن المفاتيح، الاسترجاع، الأكواد، أو الأسعار. الحالة: ${context || 'لا سياق إضافي.'}`
    : `I’m Shady’s staff assistant. Ask about keys, refunds, promo codes, or pricing. State: ${context || 'no extra context.'}`;
}

async function anthropicReply(
  apiKey: string,
  message: string,
  context: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const messages = [
    ...history.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `${SYSTEM}\nStore state: ${context}`,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((c) => c.type === 'text')?.text?.trim();
  if (!text) throw new Error('Empty Anthropic response');
  return text;
}

export async function POST(req: Request) {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_staff')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_staff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = (body.message || '').trim();
  if (!message) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 });
  }

  const context = (body.context || '').slice(0, 2000);
  const history = Array.isArray(body.history) ? body.history : [];

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const reply = apiKey
      ? await anthropicReply(apiKey, message, context, history)
      : localReply(message, context);
    return NextResponse.json({ reply, mode: apiKey ? 'anthropic' : 'local' });
  } catch (err) {
    console.error('[staff/chat]', err);
    return NextResponse.json(
      { reply: localReply(message, context), mode: 'local-fallback' },
      { status: 200 }
    );
  }
}
