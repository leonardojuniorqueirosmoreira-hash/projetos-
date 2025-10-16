const express = require('express');
const crypto = require('crypto');
const qrcode = require('qrcode');
const { z } = require('zod');

const stock = require('./handlers/stock');
const autoresponses = require('./handlers/autoresponses');
const logger = require('./services/logger');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Simple auth middleware: check Bearer token against env API_TOKEN (if set)
function requireAuth(req, res, next) {
  const token = process.env.API_TOKEN;
  if (!token) return next(); // no token configured -> open API
  const header = String(req.headers.authorization || '');
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  const got = header.slice(7).trim();
  if (got !== token) return res.status(403).json({ error: 'forbidden' });
  return next();
}

app.get('/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Optional Venom integration
let venomHelper = null;
try { venomHelper = require('./venom'); } catch (e) { /* optional */ }

app.post('/wa/send', requireAuth, async (req, res) => {
  if (!venomHelper) return res.status(501).json({ error: 'venom-not-available' });
  try {
    const { to, message } = req.body || {};
    if (!to || !message) return res.status(400).json({ error: 'to_and_message_required' });
    await venomHelper.startVenom();
    const result = await venomHelper.sendText(to, message);
    res.json({ ok: true, result });
  } catch (err) {
    logger.error('POST /wa/send error', err);
    res.status(500).json({ error: 'venom_send_failed', details: err.message });
  }
});

app.get('/wa/qr', requireAuth, async (req, res) => {
  if (!venomHelper) return res.status(501).json({ error: 'venom-not-available' });
  try {
    await venomHelper.startVenom();
    const b64 = venomHelper.getLastQr();
    if (!b64) return res.status(204).json({ error: 'no-qr-yet' });
    const img = Buffer.from(b64, 'base64');
    res.type('png').send(img);
  } catch (err) {
    logger.error('GET /wa/qr error', err);
    res.status(500).json({ error: 'venom_qr_failed' });
  }
});

app.get('/stock', async (req, res) => {
  try {
    const list = await stock.listAll();
    res.json(list);
  } catch (err) {
    logger.error('GET /stock error', err);
    res.status(500).json({ error: 'failed to list stock' });
  }
});

app.get('/stock/:key', async (req, res) => {
  try {
    const key = req.params.key;
    const item = await stock.getItem(key);
    if (!item) return res.status(404).json({ error: 'item not found' });
    res.json(item);
  } catch (err) {
    logger.error('GET /stock/:key error', err);
    res.status(500).json({ error: 'failed to get item' });
  }
});

// Validation schemas
const sellSchema = z.object({ qty: z.number().int().positive().optional().default(1) });
const generateQrSchema = z.object({ botId: z.string().optional(), sessionToken: z.string().optional(), url: z.string().url().optional(), format: z.string().optional() });
const autoresponseSchema = z.object({ text: z.string().optional().default('') });

app.post('/stock/:key/sell', requireAuth, async (req, res) => {
  try {
    const parsed = sellSchema.parse(req.body || {});
    const key = req.params.key;
    const qty = parsed.qty;
    const result = await stock.sellItem(key, qty);
    if (!result || !result.success) return res.status(400).json({ error: 'sell failed' });
    res.json(result);
  } catch (err) {
    logger.error('POST /stock/:key/sell error', err);
    if (err && err.errors) return res.status(400).json({ error: 'validation_failed', details: err.errors });
    res.status(500).json({ error: 'failed to sell item' });
  }
});

app.post('/autoresponse', requireAuth, (req, res) => {
  try {
    const parsed = autoresponseSchema.parse(req.body || {});
    const text = String(parsed.text || '');
    const reply = autoresponses.handleMessage(text);
    res.json({ reply });
  } catch (err) {
    logger.error('POST /autoresponse error', err);
    if (err && err.errors) return res.status(400).json({ error: 'validation_failed', details: err.errors });
    res.status(500).json({ error: 'failed to generate autoresponse' });
  }
});

// Generate JSON payload and optionally return a PNG image of its QR
app.post('/generate-qr', requireAuth, async (req, res) => {
  try {
    const parsed = generateQrSchema.parse(req.body || {});
    const BOT_ID = parsed.botId || process.env.BOT_ID || 'farmacia-bot';
    const SESSION_TOKEN = parsed.sessionToken || process.env.SESSION_TOKEN || crypto.randomBytes(16).toString('hex');
    const URL = parsed.url || process.env.WA_INTEGRATION_URL || 'https://wa.me/557791307594';

    const payload = {
      botId: BOT_ID,
      sessionToken: SESSION_TOKEN,
      url: URL,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex')
    };

    const json = JSON.stringify(payload);

    const wantPng = (parsed.format === 'png') || (req.query.format === 'png');
    if (wantPng) {
      const dataUrl = await qrcode.toDataURL(json, { margin: 1 });
      const base64 = dataUrl.split(',')[1];
      const img = Buffer.from(base64, 'base64');
      res.type('png').send(img);
      return;
    }

    const ascii = await new Promise((resolve) => {
      require('qrcode-terminal').generate(json, { small: true }, (q) => resolve(q));
    });

    res.json({ payload, ascii });
  } catch (err) {
    logger.error('POST /generate-qr error', err);
    if (err && err.errors) return res.status(400).json({ error: 'validation_failed', details: err.errors });
    res.status(500).json({ error: 'failed to generate qr' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'not_found' }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
