const puppeteer = require('puppeteer'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ headless: 'new' });
  for (const [f, w, h] of [['ph', 1600, 640], ['neutral', 1500, 730]]) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await p.goto('file://' + path.resolve(f + '.html')); await new Promise(r => setTimeout(r, 400));
    await p.screenshot({ path: f + '.png' }); await p.close();
  }
  await b.close(); console.log('done');
})();
