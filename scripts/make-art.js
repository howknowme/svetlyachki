// Renders store art and phone screenshots with the preinstalled Playwright.
// Usage: node scripts/make-art.js   (run from the project root)
const { chromium } = require('playwright');
const path = require('path');
const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch();
  const shot = async (mode, w, h, out, transparent) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto('file://' + root + '/store/art.html?mode=' + mode);
    await p.waitForFunction(() => document.title === 'done');
    if (transparent) await p.addStyleTag({ content: 'html,body{background:transparent!important}' });
    await p.locator('#c').screenshot({ path: out, omitBackground: !!transparent });
    await p.close();
  };
  await shot('icon', 1024, 1024, root + '/store/icon-1024.png');
  await shot('fg', 1024, 1024, root + '/store/icon-foreground-1024.png', true);
  await shot('feature', 1024, 500, root + '/store/feature-graphic-1024x500.png');

  // phone screenshots: 1080x1920 (360x640 at 3x)
  const states = [
    { name: '1-game', setup: s => s },
    { name: '2-combo', setup: s => Object.assign(s, { streak: 3, score: 1240 }) },
    { name: '3-themes', setup: s => Object.assign(s, { skin: 'candy', theme: 'sakura', level: 6, lit: 4 }) },
    { name: '5-styles', setup: s => Object.assign(s, { skin: 'gem', theme: 'neon', level: 4, lit: 2 }), open: 'style' },
    { name: '4-daily', setup: s => s, open: 'menu' }
  ];
  for (const st of states) {
    const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
    await p.goto('file://' + root + '/www/index.html');
    await p.evaluate(fn => {
      const board = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (r > 2 && (r * 3 + c * 5) % 4) ? (r + c) % 6 : -1));
      const cards = Array.from({ length: 12 }, (_, i) => i), stars = {}; cards.forEach(i => { stars[i] = 3; });
      let s = { level: 12, score: 860, best: 2140, lit: 7, board, tray: [{ s: 9, c: 1 }, { s: 11, c: 3 }, { s: 3, c: 4 }], cards, stars, sound: false, seenHelp: true, nick: 'Луна_07', nickClaimed: true, bombs: 2, shuffles: 1, undos: 1, rotates: 3 };
      s = (new Function('s', 'return (' + fn + ')(s)'))(s);
      localStorage.setItem('svetlyachki-v1', JSON.stringify(s));
    }, st.setup.toString());
    await p.reload(); await p.waitForTimeout(1500);
    if (st.open === 'style') { await p.click('#menuBtn'); await p.click('#mStyle'); await p.waitForTimeout(300); }
    if (st.open === 'menu') { await p.click('#menuBtn'); await p.waitForTimeout(300); }
    await p.screenshot({ path: root + `/store/screenshot-${st.name}.png` });
    await p.close();
  }
  await b.close();
  console.log('art done');
})();
