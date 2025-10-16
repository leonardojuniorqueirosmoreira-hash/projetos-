const qrcode = require('qrcode-terminal');

const url = process.env.WA_INTEGRATION_URL || 'https://wa.me/557791307594';
console.log('Gerando QR para:', url);
qrcode.generate(url, { small: true }, (q) => {
  console.log(q);
});
