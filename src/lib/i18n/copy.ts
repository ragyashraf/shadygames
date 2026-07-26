export type Lang = 'en' | 'ar';

export const LANG_STORAGE_KEY = 'shady-lang';

export type Copy = {
  navPlans: string;
  navGames: string;
  navDashboard: string;
  navBilling: string;
  navStaff: string;
  login: string;
  getAccess: string;
  signOut: string;
  heroKicker: string;
  heroLine2: string;
  heroBody: string;
  heroCta1: string;
  heroCta2Dash: string;
  heroCta2Signup: string;
  plansKicker: string;
  plansTitle: string;
  plansNote: string;
  monthly: string;
  yearly: string;
  subscribe: string;
  faqTitle: string;
  faqs: [string, string][];
  footerPlans: string;
  footerGames: string;
  footerTerms: string;
  footerPrivacy: string;
  footerRefunds: string;
  footerBilling: string;
  pricingKicker: string;
  pricingTitle: string;
  pricingNote: string;
  gamesKicker: string;
  gamesTitle: string;
  gamesBody: string;
  gamesLinkPlans: string;
  gamesLinkDash: string;
  gamesEmpty: string;
  gamesClosed: string;
  gamesNoPrice: string;
  gamesPaddleWait: string;
  gamesNoDesc: string;
  gamesOnce: string;
  gamesBuy: string;
  loginKicker: string;
  loginTitle: string;
  loginBody: string;
  signupKicker: string;
  signupTitle: string;
  signupBody: string;
  browsePlans: string;
  seeRanks: string;
  discordContinue: string;
  orEmail: string;
  displayName: string;
  email: string;
  password: string;
  createAccount: string;
  logIn: string;
  pleaseWait: string;
  newHere: string;
  alreadyHave: string;
  dashActive: string;
  dashInactive: string;
  dashWelcome: string;
  dashWelcomeNamed: string;
  changeRank: string;
  choosePlan: string;
  accountTitle: string;
  subscriptionsTitle: string;
  keysTitle: string;
  noSubs: string;
  noKeys: string;
  periodEnds: string;
  scheduled: string;
  billingKicker: string;
  billingTitle: string;
  billingBody: string;
  subscribeFirst: string;
  dashboard: string;
  signedIn: string;
  paddleCustomer: string;
  notLinked: string;
  accessStatus: string;
  accessOn: string;
  accessOff: string;
  manageBilling: string;
  planNames: [string, string, string];
  planPitches: [string, string, string];
  planPerks: [string[], string[], string[]];
  ribbonPopular: string;
  perMonth: string;
  perYear: string;
  welcomeTitle: string;
  welcomeBody: string;
  welcomeDash: string;
  welcomePlans: string;
  staffKicker: string;
  staffTitle: string;
  staffBody: string;
  loading: string;
  aiSupport: string;
  aiTitle: string;
  aiSub: string;
  aiThinking: string;
  aiPlaceholder: string;
  aiSend: string;
  aiGreeting: string;
  aiSuggestions: [string, string, string];
  aiError: string;
};

export const COPY: Record<Lang, Copy> = {
  en: {
    navPlans: 'Plans',
    navGames: 'Games',
    navDashboard: 'Dashboard',
    navBilling: 'Billing',
    navStaff: 'Staff',
    login: 'Log in',
    getAccess: 'Get access',
    signOut: 'Sign out',
    heroKicker: 'Live Unlimited server',
    heroLine2: 'Unlimited ranks',
    heroBody:
      'City whitelist, payouts, and Dragon perks — pick Access, Kingpin, or Dragon and get in tonight.',
    heroCta1: 'View plans',
    heroCta2Dash: 'Dashboard',
    heroCta2Signup: 'Create account',
    plansKicker: 'Ranks',
    plansTitle: 'Choose your rank',
    plansNote:
      'Monthly or yearly. Prices localize to your country. Subscribe opens checkout for the exact amount shown.',
    monthly: 'Monthly',
    yearly: 'Yearly · save 25%',
    subscribe: 'Subscribe',
    faqTitle: 'FAQ',
    faqs: [
      [
        'When do I get access?',
        'As soon as payment clears, your rank and key show on the dashboard. Join Discord with the same email you used at checkout.',
      ],
      [
        'Can I change ranks?',
        'Yes — open Billing from your account to manage the subscription, or pick a new plan here and check out again.',
      ],
      [
        'TikTok games?',
        'One-time game keys live on the Games shelf. Unlimited RP ranks are the subscriptions on this page.',
      ],
    ],
    footerPlans: 'Plans',
    footerGames: 'Games',
    footerTerms: 'Terms',
    footerPrivacy: 'Privacy',
    footerRefunds: 'Refunds',
    footerBilling: 'Billing',
    pricingKicker: 'Unlimited GTA V · Shady',
    pricingTitle: 'Choose your rank',
    pricingNote:
      'Country-localized prices from Paddle. Subscribe opens a one-page overlay checkout for the exact price shown.',
    gamesKicker: 'Shelf',
    gamesTitle: 'TikTok games',
    gamesBody:
      'One-time games stocked by staff. Live products appear here with media — Buy opens Paddle checkout automatically.',
    gamesLinkPlans: 'Unlimited subscriptions',
    gamesLinkDash: 'Dashboard',
    gamesEmpty: 'No live games yet. Staff can add them from the Products panel.',
    gamesClosed: 'The store is closed right now — check back soon.',
    gamesNoPrice: 'Checkout is syncing this game’s price — refresh and try again.',
    gamesPaddleWait: 'Checkout is still loading — try again in a moment.',
    gamesNoDesc: 'No description yet.',
    gamesOnce: 'one-time',
    gamesBuy: 'Buy now',
    loginKicker: 'Member access',
    loginTitle: 'Log in',
    loginBody:
      'Sign in with Discord or email to see your Unlimited rank, keys, and billing portal.',
    signupKicker: 'Join Unlimited',
    signupTitle: 'Create account',
    signupBody:
      'Continue with Discord, or use the same email you will check out with so Paddle can link your subscription.',
    browsePlans: 'Browse plans',
    seeRanks: 'See ranks',
    discordContinue: 'Continue with Discord',
    orEmail: 'or email',
    displayName: 'Display name',
    email: 'Email',
    password: 'Password',
    createAccount: 'Create account',
    logIn: 'Log in',
    pleaseWait: 'Please wait…',
    newHere: 'New here?',
    alreadyHave: 'Already have access?',
    dashActive: 'Subscription active',
    dashInactive: 'No active subscription',
    dashWelcome: 'Manage billing in the Paddle portal — cancel, invoices, and payment methods live there.',
    dashWelcomeNamed: 'Welcome, {name}. Manage billing in the Paddle portal — cancel, invoices, and payment methods live there.',
    changeRank: 'Change rank',
    choosePlan: 'Choose a plan',
    accountTitle: 'Account',
    subscriptionsTitle: 'Subscriptions',
    keysTitle: 'Access keys',
    noSubs: 'No mirrored subscriptions yet. After checkout, webhooks fill this in.',
    noKeys: 'Keys appear here after a completed transaction.',
    periodEnds: 'period ends',
    scheduled: 'scheduled',
    billingKicker: 'Billing',
    billingTitle: 'Account',
    billingBody:
      'Update payment method, cancel, or download invoices in the Paddle-hosted customer portal.',
    subscribeFirst: 'Subscribe first',
    dashboard: 'Dashboard',
    signedIn: 'Signed in',
    paddleCustomer: 'Paddle customer',
    notLinked: 'Not linked yet — subscribe with this email',
    accessStatus: 'Access',
    accessOn: 'Active',
    accessOff: 'Inactive',
    manageBilling: 'Manage billing',
    planNames: ['Access', 'Kingpin', 'Dragon'],
    planPitches: [
      'The key to the city. Nothing more, nothing less.',
      'Access plus a monthly payout and daily login rewards.',
      'Battlepass, custom car and the jobs nobody else can take.',
    ],
    planPerks: [
      [
        'Whitelisted access to the GTA V server',
        'Full roleplay economy, jobs and gangs',
        '2 character slots',
        'Discord member role',
      ],
      [
        'Everything in Access',
        '$1,000,000 in-game per month',
        'Daily login rewards',
        'Priority queue — never wait',
        'Custom plates + 5 garage slots',
        'Kingpin Discord role',
      ],
      [
        'Everything in Kingpin',
        'Full Battlepass access',
        '$2,000,000 in-game per month',
        'Your own custom car, built to spec',
        'Exclusive jobs and contracts',
        'Unlimited garage slots',
        'Direct line to the admin team',
      ],
    ],
    ribbonPopular: 'Most popular',
    perMonth: '/ month',
    perYear: '/ year',
    welcomeTitle: "You're in",
    welcomeBody:
      'Payment received. Your Unlimited rank unlocks as soon as Paddle confirms the transaction via webhook — open your dashboard for status and keys.',
    welcomeDash: 'Go to dashboard',
    welcomePlans: 'Back to plans',
    staffKicker: 'Staff panel',
    staffTitle: 'Catalog & fulfillment',
    staffBody:
      'Live products, discounts, and keys mirrored from Supabase. Checkout still uses Paddle price IDs on the pricing page.',
    loading: 'Loading…',
    aiSupport: 'AI support',
    aiTitle: 'Shady AI',
    aiSub: 'Staff assistant',
    aiThinking: 'Thinking…',
    aiPlaceholder: 'Ask about orders, keys, pricing…',
    aiSend: 'Send',
    aiGreeting:
      'I can help with pricing, refunds, key delivery problems and writing customer replies. What do you need?',
    aiSuggestions: [
      'A buyer did not get his key',
      'Draft a refund reply',
      'Suggest a promo code',
    ],
    aiError: 'Could not reach the assistant. Try again in a moment.',
  },
  ar: {
    navPlans: 'الاشتراكات',
    navGames: 'الألعاب',
    navDashboard: 'لوحة التحكم',
    navBilling: 'الفواتير',
    navStaff: 'الإدارة',
    login: 'تسجيل الدخول',
    getAccess: 'احصل على الوصول',
    signOut: 'تسجيل الخروج',
    heroKicker: 'سيرفر أنليميتد · متصل الآن',
    heroLine2: 'رتب أنليميتد',
    heroBody:
      'دخول المدينة والرواتب ومزايا دراغون — اختر أكسس أو كينغ بين أو دراغون وادخل الليلة.',
    heroCta1: 'عرض الباقات',
    heroCta2Dash: 'لوحة التحكم',
    heroCta2Signup: 'إنشاء حساب',
    plansKicker: 'الرتب',
    plansTitle: 'اختر رتبتك',
    plansNote:
      'شهري أو سنوي. الأسعار تتغير حسب بلدك. الاشتراك يفتح الدفع بالمبلغ الظاهر تماماً.',
    monthly: 'شهري',
    yearly: 'سنوي · وفّر 25%',
    subscribe: 'اشترك',
    faqTitle: 'الأسئلة',
    faqs: [
      [
        'متى أحصل على الوصول؟',
        'بمجرد نجاح الدفع تظهر رتبتك والمفتاح في لوحة التحكم. انضم للديسكورد بنفس البريد المستخدم عند الدفع.',
      ],
      [
        'هل يمكنني تغيير الرتبة؟',
        'نعم — افتح الفواتير من حسابك لإدارة الاشتراك، أو اختر باقة جديدة هنا وادفع مرة أخرى.',
      ],
      [
        'ألعاب تيك توك؟',
        'مفاتيح الألعاب لمرة واحدة على رف الألعاب. رتب أنليميتد هي الاشتراكات في هذه الصفحة.',
      ],
    ],
    footerPlans: 'الاشتراكات',
    footerGames: 'الألعاب',
    footerTerms: 'الشروط',
    footerPrivacy: 'الخصوصية',
    footerRefunds: 'الاسترجاع',
    footerBilling: 'الفواتير',
    pricingKicker: 'أنليميتد GTA V · شادي',
    pricingTitle: 'اختر رتبتك',
    pricingNote:
      'أسعار محلية من Paddle. الاشتراك يفتح صفحة دفع واحدة بالمبلغ الظاهر.',
    gamesKicker: 'الرف',
    gamesTitle: 'ألعاب تيك توك',
    gamesBody:
      'ألعاب لمرة واحدة يضيفها الطاقم. المنتجات المعروضة تظهر هنا مع الوسائط — الشراء يفتح Paddle تلقائياً.',
    gamesLinkPlans: 'اشتراكات أنليميتد',
    gamesLinkDash: 'لوحة التحكم',
    gamesEmpty: 'لا ألعاب معروضة بعد. يمكن للطاقم إضافتها من لوحة المنتجات.',
    gamesClosed: 'المتجر مغلق حالياً — عد لاحقاً.',
    gamesNoPrice: 'جاري مزامنة سعر هذه اللعبة — حدّث الصفحة وحاول مرة أخرى.',
    gamesPaddleWait: 'بوابة الدفع لا تزال تُحمّل — حاول بعد لحظات.',
    gamesNoDesc: 'لا يوجد وصف بعد.',
    gamesOnce: 'مرة واحدة',
    gamesBuy: 'اشترِ الآن',
    loginKicker: 'دخول الأعضاء',
    loginTitle: 'تسجيل الدخول',
    loginBody:
      'سجّل عبر ديسكورد أو البريد لرؤية رتبتك ومفاتيحك وبوابة الفواتير.',
    signupKicker: 'انضم لأنليميتد',
    signupTitle: 'إنشاء حساب',
    signupBody:
      'تابع عبر ديسكورد، أو استخدم نفس البريد الذي ستدفع به حتى يربط Paddle اشتراكك.',
    browsePlans: 'تصفح الباقات',
    seeRanks: 'عرض الرتب',
    discordContinue: 'المتابعة عبر ديسكورد',
    orEmail: 'أو بالبريد',
    displayName: 'الاسم الظاهر',
    email: 'البريد',
    password: 'كلمة المرور',
    createAccount: 'إنشاء حساب',
    logIn: 'تسجيل الدخول',
    pleaseWait: 'يرجى الانتظار…',
    newHere: 'جديد هنا؟',
    alreadyHave: 'لديك حساب؟',
    dashActive: 'الاشتراك فعّال',
    dashInactive: 'لا يوجد اشتراك فعّال',
    dashWelcome: 'أدر الفواتير من بوابة Paddle — الإلغاء والفواتير ووسائل الدفع هناك.',
    dashWelcomeNamed:
      'أهلاً {name}. أدر الفواتير من بوابة Paddle — الإلغاء والفواتير ووسائل الدفع هناك.',
    changeRank: 'تغيير الرتبة',
    choosePlan: 'اختر باقة',
    accountTitle: 'الحساب',
    subscriptionsTitle: 'الاشتراكات',
    keysTitle: 'مفاتيح الوصول',
    noSubs: 'لا اشتراكات بعد. بعد الدفع تملأها الويبهوك تلقائياً.',
    noKeys: 'تظهر المفاتيح هنا بعد إتمام عملية الشراء.',
    periodEnds: 'ينتهي في',
    scheduled: 'مجدول',
    billingKicker: 'الفواتير',
    billingTitle: 'الحساب',
    billingBody:
      'حدّث وسيلة الدفع أو ألغِ أو حمّل الفواتير من بوابة عملاء Paddle.',
    subscribeFirst: 'اشترك أولاً',
    dashboard: 'لوحة التحكم',
    signedIn: 'مسجّل الدخول',
    paddleCustomer: 'عميل Paddle',
    notLinked: 'غير مرتبط بعد — اشترك بهذا البريد',
    accessStatus: 'الوصول',
    accessOn: 'فعّال',
    accessOff: 'غير فعّال',
    manageBilling: 'إدارة الفواتير',
    planNames: ['أكسس', 'كينغ بين', 'دراغون'],
    planPitches: [
      'مفتاح المدينة. لا أكثر ولا أقل.',
      'وصول كامل مع راتب شهري ومكافآت دخول يومية.',
      'باتل باس وسيارة مخصصة ووظائف لا يصلها غيرك.',
    ],
    planPerks: [
      [
        'وصول مُفعّل إلى سيرفر GTA V',
        'اقتصاد رول بلاي كامل ووظائف وعصابات',
        'شخصيتان',
        'رتبة عضو في الديسكورد',
      ],
      [
        'كل ما في أكسس',
        '1,000,000$ داخل اللعبة شهرياً',
        'مكافآت دخول يومية',
        'أولوية في الطابور — بدون انتظار',
        'لوحات مخصصة و5 مواقف سيارات',
        'رتبة كينغ بين في الديسكورد',
      ],
      [
        'كل ما في كينغ بين',
        'وصول كامل للباتل باس',
        '2,000,000$ داخل اللعبة شهرياً',
        'سيارة مخصصة لك حسب طلبك',
        'وظائف وعقود حصرية',
        'مواقف سيارات غير محدودة',
        'تواصل مباشر مع فريق الإدارة',
      ],
    ],
    ribbonPopular: 'الأكثر اختياراً',
    perMonth: '/ شهرياً',
    perYear: '/ سنوياً',
    welcomeTitle: 'أنت داخل',
    welcomeBody:
      'تم استلام الدفع. تُفعّل رتبتك فور تأكيد Paddle عبر الويبهوك — افتح لوحة التحكم للحالة والمفاتيح.',
    welcomeDash: 'إلى لوحة التحكم',
    welcomePlans: 'العودة للباقات',
    staffKicker: 'لوحة الإدارة',
    staffTitle: 'الكتالوج والتنفيذ',
    staffBody:
      'منتجات وخصومات ومفاتيح من Supabase. الدفع ما زال يستخدم معرفات أسعار Paddle.',
    loading: 'جاري التحميل…',
    aiSupport: 'مساعد الذكاء',
    aiTitle: 'شادي AI',
    aiSub: 'مساعد الفريق',
    aiThinking: 'جاري التفكير…',
    aiPlaceholder: 'اسأل عن الطلبات والمفاتيح والأسعار…',
    aiSend: 'إرسال',
    aiGreeting:
      'أساعدك في الأسعار والاسترجاع ومشاكل تسليم المفاتيح وصياغة ردود العملاء. ما الذي تحتاجه؟',
    aiSuggestions: [
      'المشتري لم يستلم المفتاح',
      'صياغة رد استرجاع',
      'اقترح كود خصم',
    ],
    aiError: 'تعذّر الوصول للمساعد. حاول مرة أخرى بعد لحظات.',
  },
};

export function parseLang(value: string | null | undefined): Lang | null {
  if (value === 'ar' || value === 'en') return value;
  return null;
}
