const qrcode = require('qrcode-terminal');
const QRImage = (() => { try { return require('qrcode'); } catch(e){ return null; }})();
const fs = require('fs');
const crypto = require('crypto');

const BOT_ID = process.env.BOT_ID || 'farmacia-bot';
const SESSION_TOKEN = process.env.SESSION_TOKEN || crypto.randomBytes(16).toString('hex');
const URL = process.env.WA_INTEGRATION_URL || 'https://wa.me/557791307594';
const SAVE_FILE = process.env.SAVE_WA_JSON_QR_FILE; // ex: wa_payload_qr.png

const payload = {
  botId: BOT_ID,
  sessionToken: SESSION_TOKEN,
  url: URL,
  timestamp: Date.now(),
  nonce: crypto.randomBytes(8).toString('hex')
};

const json = JSON.stringify(payload);
console.log('Payload JSON:', json);

// Generate ASCII QR
qrcode.generate(json, { small: true }, (q) => {
  console.log('\nQR (scan to get payload):\n');
  console.log(q);

  if (SAVE_FILE) {
    if (!QRImage) {
      console.error('Dependência `qrcode` não instalada. Execute: npm install qrcode');
      return;
    }
    QRImage.toFile(SAVE_FILE, json, { margin: 1 }, (err) => {
      if (err) console.error('Erro ao salvar imagem do QR:', err);
      else console.log('QR salvo em:', SAVE_FILE);
    });
  }
});
