import { chromium } from 'playwright';

const TARGET = process.env.CONFIRM_URL || 'https://shadygames.xyz/pricing';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));

await page.goto(TARGET, {
  waitUntil: 'networkidle',
  timeout: 90000,
});
await page.waitForTimeout(6000);

const names = await page.locator('.tier h2').allTextContents();
const amounts = await page.locator('.amount').allTextContents();
const errors = await page.locator('.error').allTextContents();
const subscribeDisabled = await page
  .locator('button.subscribe')
  .evaluateAll((els) => els.map((e) => e.disabled));

let checkoutOpened = false;
let frames = [];
const btn = page.locator('button.subscribe:not([disabled])').first();
if ((await btn.count()) > 0) {
  await btn.click();
  await page.waitForTimeout(5000);
  frames = page.frames().map((f) => f.url());
  checkoutOpened = frames.some(
    (u) =>
      u.includes('paddle') ||
      u.includes('checkout') ||
      u.includes('buy.paddle') ||
      u.includes('cdn.paddle')
  );
  const iframeCount = await page.locator('iframe').count();
  if (!checkoutOpened && iframeCount > 0) checkoutOpened = true;
}

console.log(
  JSON.stringify(
    {
      target: TARGET,
      names,
      amounts,
      errors,
      subscribeDisabled,
      checkoutOpened,
      frames: frames.slice(0, 12),
      logs: logs.filter((l) => /paddle|error|fail/i.test(l)).slice(-25),
    },
    null,
    2
  )
);
await browser.close();
