const fs = require('fs');

async function main() {
  let venom;
  try {
    venom = require('venom-bot');
  } catch (e) {
    console.error('venom-bot not installed. Run: npm install venom-bot');
    process.exit(1);
  }

  const VENOM_DIR = process.env.VENOM_DIR || 'venom-session';
  const session = process.env.VENOM_SESSION || VENOM_DIR;
  try { require('fs').mkdirSync(VENOM_DIR, { recursive: true }); } catch (e) {}
  console.log('Starting Venom with session (dir):', VENOM_DIR);

  const headless = process.env.HEADLESS === '1';
  const defaultArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-extensions',
    '--disable-background-networking'
  ];
  const extra = (process.env.EXTRA_PUPPETEER_ARGS || '').split(' ').filter(Boolean);
  const args = defaultArgs.concat(extra);

  const opts = {
    session,
    multidevice: false,
    headless: headless, // show browser window when false
    qrTimeout: 0,
    disableSpins: true,
    createPathFileToken: true,
    puppeteerOptions: { args }
  };
  if (process.env.CHROME_PATH) opts.puppeteerOptions.executablePath = process.env.CHROME_PATH;

  let client = null;
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      client = await venom.create(opts,
        (base64Qr) => {
          try {
            const b64 = base64Qr.replace(/^data:image\/(png|jpeg);base64,/, '');
            const out = VENOM_DIR + '/venom_qr.png';
            fs.writeFileSync(out, Buffer.from(b64, 'base64'));
            console.log('QR received and saved to', out);
          } catch (err) {
            console.log('QR callback error:', err && err.message);
          }
        },
        (status) => {
          console.log('Venom status:', status);
        }
      );
      break;
    } catch (err) {
      console.warn(`Venom start attempt ${attempt} failed: ${err && err.message}`);
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 2000 * attempt));
      else throw err;
    }
  }

  client.onStateChange && client.onStateChange((state) => console.log('state:', state));

  process.on('SIGINT', async () => {
    console.log('Shutting down Venom...');
    try { await client.close(); } catch (e) {}
    process.exit(0);
  });

  console.log('Venom started. Waiting for QR or ready state...');
}

main().catch((err) => { console.error('Failed to start venom:', err); process.exit(1); });
