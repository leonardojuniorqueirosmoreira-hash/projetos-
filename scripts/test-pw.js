(async ()=>{
  try{
    const puppeteer = require('puppeteer');
    const execPath = process.env.CHROME_PATH || puppeteer.executablePath();
    console.log('Using executable:', execPath);
    const browser = await puppeteer.launch({ executablePath: execPath, headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err && err.message));
    try{
      const res = await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2', timeout: 30000 });
      console.log('Response status:', res && res.status());
    } catch(e) {
      console.error('goto error:', e && e.message);
    }
    await page.screenshot({ path: 'puppeteer-webwhatsapp.png', fullPage: true });
    console.log('Screenshot saved: puppeteer-webwhatsapp.png');
    await browser.close();
  }catch(e){
    console.error('Puppeteer test failed:', e && e.message);
    process.exit(1);
  }
})();
