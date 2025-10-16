// Optional Venom integration helper. Starts only when USE_VENOM=1
const EventEmitter = require('events');
let venom = null;
let client = null;
const ee = new EventEmitter();
let lastQr = null;

async function startVenom() {
  if (process.env.USE_VENOM !== '1') return null;
  if (client) return client;
  try {
    venom = require('venom-bot');
  } catch (e) {
    console.warn('venom-bot not installed; skip startVenom');
    return null;
  }

  const VENOM_DIR = process.env.VENOM_DIR || 'venom-session';
  try { require('fs').mkdirSync(VENOM_DIR, { recursive: true }); } catch (e) {}

  client = await venom.create({
    session: VENOM_DIR,
    multidevice: false,
    headless: true,
    qrTimeout: 0,
    disableSpins: true,
    createPathFileToken: true,
    puppeteerOptions: { args: ['--no-sandbox'] }
  },
  (base64Qr) => {
    lastQr = base64Qr;
    ee.emit('qr', base64Qr);
  },
  (status) => {
    ee.emit('status', status);
  });

  client.onStateChange && client.onStateChange((state) => ee.emit('state', state));
  return client;
}

async function sendText(to, message) {
  if (!client) throw new Error('venom-not-started');
  return client.sendText(to, message);
}

function getLastQr() {
  return lastQr;
}

module.exports = { startVenom, sendText, getLastQr, events: ee };
