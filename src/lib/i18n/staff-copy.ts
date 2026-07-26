export type StaffLang = 'en' | 'ar';

export type StaffCopy = {
  staffPanel: string;
  owner: string;
  viewSite: string;
  serverOnline: string;
  nav: [string, string, string, string, string, string];
  titles: [string, string, string, string, string, string];
  subs: [string, string, string, string, string, string];
  kpis: [string, string, string, string];
  revenue7: string;
  keyHealth: string;
  activity: string;
  days: [string, string, string, string, string, string, string];
  productName: string;
  productNamePh: string;
  type: string;
  typeSub: string;
  typeKey: string;
  typeGame: string;
  price: string;
  stock: string;
  addProduct: string;
  saveProduct: string;
  cancelEdit: string;
  edit: string;
  gameDesc: string;
  gameDescPh: string;
  gameImages: string;
  gameVideos: string;
  gameUrlsPh: string;
  gameVideoUrlsPh: string;
  uploadImages: string;
  uploadVideos: string;
  paddlePriceId: string;
  mediaUploaded: string;
  remove: string;
  productCols: [string, string, string, string, string, string];
  live: string;
  hidden: string;
  unlimitedStock: string;
  code: string;
  percentOff: string;
  maxUses: string;
  expires: string;
  addCode: string;
  codeCols: [string, string, string, string, string, string];
  active: string;
  paused: string;
  addKeys: string;
  addKeysHint: string;
  forProduct: string;
  pasteKeys: string;
  pasteKeysPh: string;
  autoDeliver: string;
  importKeys: string;
  deliveryRules: string;
  deliveryNote: string;
  rules: [string, string][];
  keyCols: [string, string, string, string, string];
  keyStatus: { available: string; delivered: string; reserved: string };
  keyImported: string;
  keyEmpty: string;
  txFilters: [string, string, string, string];
  txCols: [string, string, string, string, string, string, string];
  txStatus: { paid: string; pending: string; refunded: string; completed: string };
  refund: string;
  resend: string;
  approve: string;
  txSummary: string;
  storeSettings: string;
  staffAccess: string;
  toggles: [string, string][];
  on: string;
  off: string;
  noRows: string;
  saved: string;
  activeSubsShort: string;
  storeClosedBanner: string;
  noProductForKeys: string;
  refundedOk: string;
  keyAssigned: string;
  keyAlreadyAssigned: string;
  noStaffYet: string;
  staffTag: string;
  serverSlots: string;
  planShort: [string, string, string];
  perMonthLabel: string;
  perYearLabel: string;
};

export const STAFF_COPY: Record<StaffLang, StaffCopy> = {
  en: {
    staffPanel: 'Staff panel',
    owner: 'Owner',
    viewSite: 'View site',
    serverOnline: 'Unlimited online',
    nav: ['Overview', 'Products', 'Discount codes', 'Keys', 'Transactions', 'Settings'],
    titles: ['Overview', 'Products', 'Discount codes', 'Key inventory', 'Transactions', 'Settings'],
    subs: [
      'Live numbers for the Unlimited GTA V server and the TikTok game shelf.',
      'Add, remove, re-price and hide anything you sell. TikTok games support description, images and videos.',
      'Create codes, cap their uses and pull them when a promo ends.',
      'Paste keys once — buyers get one automatically the moment payment clears.',
      'Every payment, its key delivery, and one-click refunds.',
      'Delivery, payouts and who on the team can touch what.',
    ],
    kpis: ['Revenue today', 'Active subs', 'Keys left', 'Pending txs'],
    revenue7: 'Revenue · recent',
    keyHealth: 'Key stock',
    activity: 'Latest activity',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    productName: 'Product name',
    productNamePh: 'Dragon rank · monthly',
    type: 'Type',
    typeSub: 'GTA subscription',
    typeKey: 'Key product',
    typeGame: 'TikTok game',
    price: 'Price',
    stock: 'Stock',
    addProduct: 'Add product',
    saveProduct: 'Save changes',
    cancelEdit: 'Cancel',
    edit: 'Edit',
    gameDesc: 'Description',
    gameDescPh: 'What buyers get — gameplay, how keys work, delivery notes…',
    gameImages: 'Image URLs (one per line)',
    gameVideos: 'Video URLs (YouTube / Vimeo / direct file)',
    gameUrlsPh: 'https://…/cover.webp',
    gameVideoUrlsPh: 'https://youtu.be/… or https://…/clip.mp4',
    uploadImages: 'Upload images',
    uploadVideos: 'Upload videos',
    paddlePriceId: 'Paddle price ID (one-time)',
    mediaUploaded: 'Media uploaded.',
    remove: 'Remove',
    productCols: ['Product', 'Type', 'Price', 'Stock', 'Status', ''],
    live: 'Live',
    hidden: 'Hidden',
    unlimitedStock: 'Unlimited',
    code: 'Code',
    percentOff: '% off',
    maxUses: 'Max uses',
    expires: 'Expires',
    addCode: 'Add code',
    codeCols: ['Code', 'Discount', 'Used', 'Expires', 'Status', ''],
    active: 'Active',
    paused: 'Paused',
    addKeys: 'Add keys',
    addKeysHint: 'One key per line. Duplicates are skipped automatically.',
    forProduct: 'For product',
    pasteKeys: 'Paste keys',
    pasteKeysPh: 'UNL-XXXX-XXXX-XXXX',
    autoDeliver: 'Auto-deliver on payment',
    importKeys: 'Import keys',
    deliveryRules: 'Delivery rules',
    deliveryNote:
      "When a payment clears, the next unused key for that product is reserved and shown on the buyer's dashboard. If stock hits zero the product should be hidden instead of overselling.",
    rules: [
      ['Instant delivery', 'Send the key the second the payment webhook confirms.'],
      ['Low-stock alert', 'Ping staff Discord when a product drops under 10 keys.'],
      ['Fraud hold', 'Hold delivery for review on first-time crypto payments.'],
    ],
    keyCols: ['Key', 'Product', 'Status', 'Assigned to', ''],
    keyStatus: { available: 'Available', delivered: 'Delivered', reserved: 'Reserved' },
    keyImported: 'Imported {n} keys.',
    keyEmpty: 'Paste at least one key first.',
    txFilters: ['All', 'Paid', 'Pending', 'Refunded'],
    txCols: ['ID', 'Customer', 'Item', 'Amount', 'Status', 'When', ''],
    txStatus: {
      paid: 'Paid',
      pending: 'Pending',
      refunded: 'Refunded',
      completed: 'Completed',
    },
    refund: 'Refund',
    resend: 'Resend key',
    approve: 'Approve',
    txSummary: '{n} transactions · {sum} collected',
    storeSettings: 'Store settings',
    staffAccess: 'Staff access',
    toggles: [
      ['Store open', 'Turn off to stop all checkouts instantly.'],
      ['Accept crypto', 'USDT, BTC and ETH via the payment gateway.'],
      ['Discount codes', 'Allow codes at checkout.'],
      ['Auto whitelist', 'Push new subscribers to the FiveM whitelist.'],
      ['Arabic storefront', 'Show the Arabic version to new visitors from Arabic locales.'],
    ],
    on: 'On',
    off: 'Off',
    noRows: 'Nothing here yet.',
    saved: 'Saved.',
    activeSubsShort: 'active',
    storeClosedBanner: 'Store is closed — checkout is disabled on the site.',
    noProductForKeys: 'Add a product first, then import keys for its SKU.',
    refundedOk: 'Refund submitted to Paddle and marked locally.',
    keyAssigned: 'Key assigned: {key}',
    keyAlreadyAssigned: 'Key already on this order: {key}',
    noStaffYet: 'No staff profiles yet. Set is_staff on a profile in Supabase.',
    staffTag: 'Staff',
    serverSlots: 'Server slot capacity',
    planShort: ['Access', 'Kingpin', 'Dragon'],
    perMonthLabel: 'monthly',
    perYearLabel: 'yearly',
  },
  ar: {
    staffPanel: 'لوحة الإدارة',
    owner: 'المالك',
    viewSite: 'عرض الموقع',
    serverOnline: 'أنليميتد يعمل',
    nav: ['نظرة عامة', 'المنتجات', 'أكواد الخصم', 'المفاتيح', 'المعاملات', 'الإعدادات'],
    titles: ['نظرة عامة', 'المنتجات', 'أكواد الخصم', 'مخزون المفاتيح', 'المعاملات', 'الإعدادات'],
    subs: [
      'أرقام مباشرة لسيرفر أنليميتد GTA V ورف ألعاب تيك توك.',
      'أضف أو احذف أو غيّر الأسعار وأخفِ أي منتج. ألعاب تيك توك تدعم الوصف والصور والفيديو.',
      'أنشئ أكواداً وحدد عدد استخداماتها وأوقفها عند انتهاء العرض.',
      'الصق المفاتيح مرة واحدة — والمشتري يستلم مفتاحه تلقائياً بعد الدفع.',
      'كل عملية دفع وتسليم مفتاحها والاسترجاع بضغطة واحدة.',
      'التسليم والمدفوعات وصلاحيات فريق العمل.',
    ],
    kpis: ['إيراد اليوم', 'الاشتراكات النشطة', 'المفاتيح المتاحة', 'معاملات معلّقة'],
    revenue7: 'الإيرادات · الأخيرة',
    keyHealth: 'مخزون المفاتيح',
    activity: 'آخر النشاطات',
    days: ['إث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'],
    productName: 'اسم المنتج',
    productNamePh: 'رتبة دراغون · شهري',
    type: 'النوع',
    typeSub: 'اشتراك GTA',
    typeKey: 'منتج بمفتاح',
    typeGame: 'لعبة تيك توك',
    price: 'السعر',
    stock: 'المخزون',
    addProduct: 'أضف منتجاً',
    saveProduct: 'حفظ التعديلات',
    cancelEdit: 'إلغاء',
    edit: 'تعديل',
    gameDesc: 'الوصف',
    gameDescPh: 'ماذا يحصل المشتري — اللعب، المفاتيح، ملاحظات التسليم…',
    gameImages: 'روابط الصور (سطر لكل رابط)',
    gameVideos: 'روابط الفيديو (يوتيوب / فيميو / ملف مباشر)',
    gameUrlsPh: 'https://…/cover.webp',
    gameVideoUrlsPh: 'https://youtu.be/… أو https://…/clip.mp4',
    uploadImages: 'رفع صور',
    uploadVideos: 'رفع فيديو',
    paddlePriceId: 'معرّف سعر Paddle (مرة واحدة)',
    mediaUploaded: 'تم رفع الوسائط.',
    remove: 'حذف',
    productCols: ['المنتج', 'النوع', 'السعر', 'المخزون', 'الحالة', ''],
    live: 'معروض',
    hidden: 'مخفي',
    unlimitedStock: 'غير محدود',
    code: 'الكود',
    percentOff: 'نسبة الخصم',
    maxUses: 'حد الاستخدام',
    expires: 'ينتهي',
    addCode: 'أضف كوداً',
    codeCols: ['الكود', 'الخصم', 'الاستخدام', 'ينتهي', 'الحالة', ''],
    active: 'مفعّل',
    paused: 'موقوف',
    addKeys: 'إضافة مفاتيح',
    addKeysHint: 'مفتاح واحد في كل سطر. المتكرر يُتجاهل تلقائياً.',
    forProduct: 'للمنتج',
    pasteKeys: 'الصق المفاتيح',
    pasteKeysPh: 'UNL-XXXX-XXXX-XXXX',
    autoDeliver: 'تسليم تلقائي بعد الدفع',
    importKeys: 'استيراد المفاتيح',
    deliveryRules: 'قواعد التسليم',
    deliveryNote:
      'عند تأكيد الدفع يُحجز أول مفتاح غير مستخدم لذلك المنتج ويظهر في لوحة المشتري. وإذا نفد المخزون يُخفى المنتج تلقائياً بدلاً من البيع الزائد.',
    rules: [
      ['تسليم فوري', 'أرسل المفتاح لحظة تأكيد الدفع.'],
      ['تنبيه المخزون', 'أشعر الفريق في الديسكورد عند نزول المنتج تحت 10 مفاتيح.'],
      ['تعليق للمراجعة', 'علّق التسليم للمراجعة في أول دفعة بالعملات الرقمية.'],
    ],
    keyCols: ['المفتاح', 'المنتج', 'الحالة', 'مُسند إلى', ''],
    keyStatus: { available: 'متاح', delivered: 'تم التسليم', reserved: 'محجوز' },
    keyImported: 'تم استيراد {n} مفتاحاً.',
    keyEmpty: 'الصق مفتاحاً واحداً على الأقل.',
    txFilters: ['الكل', 'مدفوع', 'معلّق', 'مُسترجع'],
    txCols: ['الرقم', 'العميل', 'المنتج', 'المبلغ', 'الحالة', 'الوقت', ''],
    txStatus: {
      paid: 'مدفوع',
      pending: 'معلّق',
      refunded: 'مُسترجع',
      completed: 'مكتمل',
    },
    refund: 'استرجاع',
    resend: 'إعادة إرسال',
    approve: 'اعتماد',
    txSummary: '{n} معاملة · {sum} محصّلة',
    storeSettings: 'إعدادات المتجر',
    staffAccess: 'صلاحيات الفريق',
    toggles: [
      ['المتجر مفتوح', 'أوقفه لإيقاف جميع عمليات الشراء فوراً.'],
      ['قبول العملات الرقمية', 'USDT وBTC وETH عبر بوابة الدفع.'],
      ['أكواد الخصم', 'السماح باستخدام الأكواد عند الدفع.'],
      ['قائمة تلقائية', 'إضافة المشتركين الجدد إلى قائمة FiveM تلقائياً.'],
      ['واجهة عربية', 'إظهار النسخة العربية للزوار من البلدان العربية.'],
    ],
    on: 'مفعّل',
    off: 'موقوف',
    noRows: 'لا يوجد شيء هنا بعد.',
    saved: 'تم الحفظ.',
    activeSubsShort: 'نشط',
    storeClosedBanner: 'المتجر مغلق — الدفع معطّل على الموقع.',
    noProductForKeys: 'أضف منتجاً أولاً ثم استورد مفاتيح لرمز SKU الخاص به.',
    refundedOk: 'تم إرسال الاسترجاع إلى Paddle وتحديث الحالة محلياً.',
    keyAssigned: 'تم تعيين المفتاح: {key}',
    keyAlreadyAssigned: 'المفتاح مربوط بهذا الطلب: {key}',
    noStaffYet: 'لا يوجد موظفون بعد. فعّل is_staff لملف في Supabase.',
    staffTag: 'طاقم',
    serverSlots: 'سعة مقاعد السيرفر',
    planShort: ['أكسس', 'كينغ بين', 'دراغون'],
    perMonthLabel: 'شهري',
    perYearLabel: 'سنوي',
  },
};
