/**
 * Paddle catalog for Shady / Unlimited.
 * Client-side token is public (safe in frontend). Never put API keys here.
 * Staff products/discounts sync via localStorage key shady-store-catalog.
 */
window.SHADY_PADDLE = {
  // Live is active for verification prep — do not open to real customers until domain is approved.
  environment: 'live', // 'live' | 'sandbox'
  clientToken: {
    live: 'live_4f3118c98bc1c391c13a96eb115',
    sandbox: '' // add test_… token when you create one in sandbox
  },
  product: {
    live: 'pro_01kyg2b0n44kqb7b375rrn9n4v',
    sandbox: 'pro_01kyg2b0q10yh01a6xgr3jqxmn',
    name: 'GTA 5 Server Unlimited'
  },
  // Monthly subscription ranks
  prices: {
    access: {
      sku: 'GTA-ACCESS',
      name: 'Access rank · monthly',
      amountUsd: 10,
      live: 'pri_01kyg2b0r3s48y5kaprr34ayjm',
      sandbox: 'pri_01kyg2b0rwkmd0a1zr3wyk78a9'
    },
    kingpin: {
      sku: 'GTA-KING',
      name: 'Kingpin rank · monthly',
      amountUsd: 15,
      live: 'pri_01kyg2b0vd93hacjzp8fq2nw4z',
      sandbox: 'pri_01kyg2b0tvk1dv50gh7b326b8k'
    },
    dragon: {
      sku: 'GTA-DRAGON',
      name: 'Dragon rank · monthly',
      amountUsd: 25,
      live: 'pri_01kyg2b0z73014d11dt72fd5ct',
      sandbox: 'pri_01kyg2b0wn3f4jts8etb260vyz'
    }
  }
};

window.ShadyCatalog = (function () {
  const KEY = 'shady-store-catalog';
  const cfg = () => window.SHADY_PADDLE;

  function env() {
    return (cfg() && cfg().environment) === 'sandbox' ? 'sandbox' : 'live';
  }

  function clientToken() {
    const c = cfg();
    return (c.clientToken && c.clientToken[env()]) || '';
  }

  function priceId(tier) {
    const p = cfg().prices[tier];
    if (!p) return null;
    return p[env()] || null;
  }

  function defaultProducts() {
    const c = cfg();
    return Object.keys(c.prices).map(function (tier) {
      const p = c.prices[tier];
      return {
        id: tier,
        tier: tier,
        name: p.name,
        sku: p.sku,
        kind: 'sub',
        price: String(p.amountUsd),
        stock: null,
        live: true,
        paddlePriceId: p[env()],
        paddleProductId: c.product[env()]
      };
    });
  }

  function load() {
    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch (e) {}
    var products = (saved && Array.isArray(saved.products) && saved.products.length)
      ? saved.products
      : defaultProducts();
    // Always refresh paddle IDs for known SKUs from config
    products = products.map(function (p) {
      var match = Object.keys(cfg().prices).find(function (tier) {
        return cfg().prices[tier].sku === p.sku || tier === p.tier || tier === p.id;
      });
      if (match) {
        return Object.assign({}, p, {
          tier: match,
          paddlePriceId: cfg().prices[match][env()],
          paddleProductId: cfg().product[env()],
          live: p.live !== false
        });
      }
      return p;
    });
    var discounts = (saved && Array.isArray(saved.discounts)) ? saved.discounts : [];
    return { products: products, discounts: discounts };
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        products: data.products || [],
        discounts: data.discounts || [],
        updatedAt: Date.now()
      }));
    } catch (e) {}
  }

  function productByPlan(plan) {
    var cat = load();
    return cat.products.find(function (p) {
      return p.live !== false && (p.tier === plan || p.id === plan || p.sku === 'GTA-' + String(plan || '').toUpperCase());
    }) || null;
  }

  function activeDiscount(code) {
    if (!code) return null;
    var raw = String(code).trim().toUpperCase();
    var d = load().discounts.find(function (x) {
      return x.active !== false && String(x.code || '').toUpperCase() === raw;
    });
    return d || null;
  }

  return {
    KEY: KEY,
    env: env,
    clientToken: clientToken,
    priceId: priceId,
    load: load,
    save: save,
    defaultProducts: defaultProducts,
    productByPlan: productByPlan,
    activeDiscount: activeDiscount
  };
})();
